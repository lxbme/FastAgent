// Constants and DOM Elements
const UI = {
    elements: {
        recordButton: document.getElementById('recordButton'),
        stopButton: document.getElementById('stopButton'),
        statusParagraph: document.getElementById('status'),
        resultDiv: document.getElementById('result'),
        languageSelect: document.getElementById('languageSelect'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        promptDiv: document.getElementById('prompt-div'),
        textInput: document.getElementById('textInput'),
        submitButton: document.getElementById('submitButton')
    },
    markdownParser: window.markdownit()
};

// Audio Recording Controller
class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    async startRecording() {
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error('您的浏览器不支持音频录制功能。');
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.addEventListener('dataavailable', event => {
                this.audioChunks.push(event.data);
            });

            this.mediaRecorder.start();
            return true;
        } catch (err) {
            console.error('获取音频权限失败：', err);
            throw new Error('无法访问麦克风，请检查浏览器设置。');
        }
    }

    stopRecording() {
        this.mediaRecorder.stop();
        return new Promise(resolve => {
            this.mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                resolve(audioBlob);
            });
        });
    }
}

// API Service
class APIService {
    static async processAudio(audioBlob, language) {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('language', language);

        const response = await fetch('http://localhost:8000/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('网络响应不正常');
        }

        return response.json();
    }

    static async processText(text, language) {
        const response = await fetch('http://localhost:8000/text_process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, language })
        });

        if (!response.ok) {
            throw new Error('网络响应错误');
        }

        return response.json();
    }
}

// UI Handler
class UIHandler {
    constructor(ui) {
        this.ui = ui;
    }

    updateUIForRecordingStart() {
        this.ui.elements.statusParagraph.textContent = '正在录音...';
        this.ui.elements.recordButton.disabled = true;
        this.ui.elements.stopButton.disabled = false;
    }

    updateUIForRecordingStop() {
        this.ui.elements.statusParagraph.textContent = '录音已停止，正在上传音频...';
        this.ui.elements.recordButton.disabled = false;
        this.ui.elements.stopButton.disabled = true;
    }

    showLoading() {
        this.ui.elements.loadingSpinner.style.display = 'inline-block';
    }

    hideLoading() {
        this.ui.elements.loadingSpinner.style.display = 'none';
        this.ui.elements.statusParagraph.textContent = ' ';
    }

    createPromptElement(data, icon) {
        const prompt = document.createElement('div');
        prompt.classList.add("alert", "alert-light");

        const iconElement = document.createElement('i');
        iconElement.classList.add("fa", icon);
        iconElement.style = "margin-right: 10px;";
        iconElement.setAttribute("aria-hidden", "true");

        const promptText = document.createElement('span');
        promptText.textContent = data.prompt;

        prompt.append(iconElement, promptText);
        return prompt;
    }

    createResultCard(promptElement) {
        const card = document.createElement('div');
        card.classList.add("card");
        card.style = "margin-top: 20px;";

        const cardBody = document.createElement('div');
        cardBody.classList.add("card-body");

        card.appendChild(cardBody);
        cardBody.appendChild(promptElement);

        return { card, cardBody };
    }

    renderContent(data, cardBody) {
        switch (data.type) {
            case 'text':
                const textDiv = document.createElement('div');
                const markdownContent = this.ui.markdownParser.render(data.content);
                textDiv.innerHTML = DOMPurify.sanitize(markdownContent);
                cardBody.appendChild(textDiv);
                break;

            case 'image':
                const imageCard = document.createElement('div');
                imageCard.className = 'card';
                imageCard.style = "width:512px;";

                const img = document.createElement('img');
                img.src = 'data:image/png;base64,' + data.content;
                img.classList.add('card-img-top');

                imageCard.appendChild(img);
                cardBody.appendChild(imageCard);
                break;

            case 'mermaid':
                const mermaidDiv = document.createElement('div');
                mermaidDiv.className = 'mermaid';
                mermaidDiv.textContent = data.content;
                cardBody.appendChild(mermaidDiv);
                mermaid.init(undefined, mermaidDiv);
                break;

            case 'error':
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-warning';
                alertDiv.role = 'alert';
                alertDiv.textContent = data.content;
                cardBody.appendChild(alertDiv);
                break;

            default:
                const unknownAlert = document.createElement('div');
                unknownAlert.className = 'alert alert-warning';
                unknownAlert.role = 'alert';
                unknownAlert.textContent = '未知的内容类型。';
                cardBody.appendChild(unknownAlert);
        }
    }

    showError(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger';
        alertDiv.role = 'alert';
        alertDiv.textContent = message;
        this.ui.elements.resultDiv.prepend(alertDiv);
    }
}

// Main App Controller
class AppController {
    constructor() {
        this.recorder = new AudioRecorder();
        this.uiHandler = new UIHandler(UI);
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        UI.elements.recordButton.addEventListener('click', () => this.handleRecordStart());
        UI.elements.stopButton.addEventListener('click', () => this.handleRecordStop());
        UI.elements.submitButton.addEventListener('click', () => this.handleTextSubmit());
    }

    async handleRecordStart() {
        try {
            await this.recorder.startRecording();
            this.uiHandler.updateUIForRecordingStart();
        } catch (error) {
            alert(error.message);
        }
    }

    async handleRecordStop() {
        this.uiHandler.updateUIForRecordingStop();
        try {
            const audioBlob = await this.recorder.stopRecording();
            await this.processAndRenderResult(audioBlob);
        } catch (error) {
            console.error('处理录音失败：', error);
            this.uiHandler.showError('处理录音失败，请稍后重试。');
        }
    }

    async handleTextSubmit() {
        const text = UI.elements.textInput.value.trim();
        if (!text) {
            this.uiHandler.showError('输入文本不能为空');
            return;
        }

        UI.elements.textInput.value = '';
        this.uiHandler.showLoading();

        try {
            const data = await APIService.processText(text, UI.elements.languageSelect.value);
            this.renderResult(data, 'fa-keyboard-o');
        } catch (error) {
            console.error('处理文本失败：', error);
            this.uiHandler.showError('处理文本失败，请稍后重试。');
        } finally {
            this.uiHandler.hideLoading();
        }
    }

    async processAndRenderResult(audioBlob) {
        this.uiHandler.showLoading();
        try {
            const data = await APIService.processAudio(audioBlob, UI.elements.languageSelect.value);
            this.renderResult(data, 'fa-microphone');
        } catch (error) {
            console.error('处理音频失败：', error);
            this.uiHandler.showError('处理音频失败，请稍后重试。');
        } finally {
            this.uiHandler.hideLoading();
        }
    }

    renderResult(data, iconClass) {
        const promptElement = this.uiHandler.createPromptElement(data, iconClass);
        const { card, cardBody } = this.uiHandler.createResultCard(promptElement);
        this.uiHandler.renderContent(data, cardBody);
        UI.elements.resultDiv.append(card);
    }
}

// Initialize the application
const app = new AppController();