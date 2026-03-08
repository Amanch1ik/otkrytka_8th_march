// ===== Конфигурация =====
const CONFIG = {
    petalCount: window.innerWidth <= 600 ? 25 : 60,
    greetingText: "Поздравляем вас с прекрасным весенним праздником - 8 Марта! Вы делаете нашу учёбу ярче, теплее и интереснее. Спасибо вам за вашу доброту, улыбки и поддержку! Желаем вам океан счастья, море любви, вдохновения и исполнения самых заветных мечтаний! Пусть каждый день дарит вам только радость и приятные сюрпризы. Будьте всегда такими же прекрасными!",
    typeSpeed: 50,
    petalsDelay: 1500,

    // Временные метки (в секундах) для цензурирования нецензурных слов
    // Формат: [начало, конец] — аудио будет заглушено в эти отрезки
    muteRanges: [
        // Добавь нужные интервалы, например: [2.5, 3.2] заглушит с 2.5 до 3.2 сек
        // Пока ставим примерные — можно подкорректировать
    ],
};

// ===== Инициализация =====
window.addEventListener("load", () => {
    // Проверить параметр имени в URL
    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get("name");
    if (nameParam) {
        document.getElementById("name").textContent = nameParam;
    }

    // Показать intro-экран с видео
    showVideoIntro();

});

// ===== Показать видео intro при загрузке =====
function showVideoIntro() {
    const intro = document.getElementById("video-intro");
    const video = document.getElementById("intro-video");
    const skipBtn = document.getElementById("skip-btn");

    // Показать intro
    intro.classList.add("active");

    // Цензурирование аудио — глушим в нужные моменты
    video.addEventListener("timeupdate", () => {
        const t = video.currentTime;
        let shouldMute = false;
        for (const [start, end] of CONFIG.muteRanges) {
            if (t >= start && t <= end) {
                shouldMute = true;
                break;
            }
        }
        video.muted = shouldMute;
    });

    // Когда видео закончится — перейти к открытке
    video.addEventListener("ended", () => {
        transitionToCard();
    });

    // Кнопка "Пропустить"
    skipBtn.addEventListener("click", () => {
        video.pause();
        transitionToCard();
    });

    // Начать с 4-й секунды (обрезаем начало)
    video.currentTime = 4;

    // Перестраховка для мобильных — если видео началось с 0, перемотать
    video.addEventListener("playing", function onFirstPlay() {
        if (video.currentTime < 3.5) {
            video.currentTime = 4;
        }
        video.removeEventListener("playing", onFirstPlay);
    });

    // Попытаться запустить видео
    video.play().catch(() => {
        // Автовоспроизведение заблокировано — показать кнопку "Смотреть"
        document.getElementById("play-btn").style.display = "flex";
    });
}

// ===== Кнопка "Смотреть" (если автоплей заблокирован) =====
function playIntroVideo() {
    const video = document.getElementById("intro-video");
    const playBtn = document.getElementById("play-btn");
    playBtn.style.display = "none";
    video.currentTime = 4;
    video.play();
}

// ===== Плавный переход от видео к открытке =====
function transitionToCard() {
    const intro = document.getElementById("video-intro");

    // Плавно скрыть видео
    intro.classList.add("fade-out");

    setTimeout(() => {
        intro.style.display = "none";

        // Запустить CSS-анимации цветов
        document.body.classList.remove("not-loaded");

        // Запуск лепестков
        setTimeout(createPetals, CONFIG.petalsDelay);

        // Показать карточку через 3 секунды (после того как цветы начнут расти)
        setTimeout(showCard, 3500);
    }, 1200);
}

// ===== Генерация падающих лепестков =====
function createPetals() {
    const container = document.getElementById("petals");
    const w = window.innerWidth;

    for (let i = 0; i < CONFIG.petalCount; i++) {
        const petal = document.createElement("div");
        petal.classList.add("petal");

        const left = Math.random() * w;
        const size = 14 + Math.random() * 14;
        const duration = 8 + Math.random() * 12;
        const delay = Math.random() * 10;
        const sway = -60 + Math.random() * 120;

        petal.style.left = left + "px";
        petal.style.width = size + "px";
        petal.style.height = size + "px";
        petal.style.setProperty("--fall-duration", duration + "s");
        petal.style.setProperty("--fall-delay", delay + "s");
        petal.style.setProperty("--sway", sway + "px");

        container.appendChild(petal);
    }
}

// ===== Показ карточки =====
function showCard() {
    const card = document.getElementById("card");
    card.classList.add("visible");

    // Показать заголовок через 500мс
    setTimeout(() => {
        document.getElementById("card-title").classList.add("visible");
    }, 500);

    // Начать печатать текст через 1.5 секунды
    setTimeout(() => {
        typeText(CONFIG.greetingText, document.getElementById("card-text"), () => {
            // После завершения печати — показать автора
            setTimeout(() => {
                document.getElementById("card-author").classList.add("visible");
                // Показать кнопку повторного просмотра видео
                setTimeout(() => {
                    document.getElementById("video-btn").classList.add("visible");
                }, 1000);
            }, 600);
        });
    }, 1500);
}

// ===== Эффект печатающегося текста =====
function typeText(text, element, onComplete) {
    let index = 0;
    const cursor = document.createElement("span");
    cursor.classList.add("cursor");
    element.appendChild(cursor);

    function typeChar() {
        if (index < text.length) {
            const char = text[index];
            if (char === "\n") {
                element.insertBefore(document.createElement("br"), cursor);
            } else {
                element.insertBefore(document.createTextNode(char), cursor);
            }
            index++;

            const currentSpeed = CONFIG.typeSpeed + (Math.random() * 30 - 15);
            const pauseChars = [".", "!", "?", ",", "—"];
            const nextDelay = pauseChars.includes(char) ? currentSpeed + 200 : currentSpeed;
            setTimeout(typeChar, nextDelay);
        } else {
            setTimeout(() => {
                cursor.style.display = "none";
                if (onComplete) onComplete();
            }, 2000);
        }
    }

    typeChar();
}

// ===== Видео модал (повторный просмотр) =====
function openVideo() {
    const modal = document.getElementById("video-modal");
    const video = document.getElementById("modal-video");
    modal.style.display = "flex";
    requestAnimationFrame(() => {
        modal.classList.add("active");
    });
    video.currentTime = 0;
    video.play();
}

function closeVideo(event, forceClose) {
    const modal = document.getElementById("video-modal");
    const video = document.getElementById("modal-video");
    if (forceClose || event.target === modal) {
        video.pause();
        modal.classList.remove("active");
        setTimeout(() => {
            modal.style.display = "none";
        }, 400);
    }
}
