'use strict';
/* =========================================================
   Мессенджер на Firebase Realtime Database
   Фото, стикеры и видео хранятся в базе (узел images/).
   ========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyC0F3dkJH6Fe7JzLQSFdn74ALvaWI2zF_k",
    authDomain: "mychat-4d0e8.firebaseapp.com",
    databaseURL: "https://mychat-4d0e8-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mychat-4d0e8",
    storageBucket: "mychat-4d0e8.firebasestorage.app",
    messagingSenderId: "238012476623",
    appId: "1:238012476623:web:152f858dbfc56ad3491bba"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
try { auth.useDeviceLanguage(); } catch (e) {}
const db = firebase.database();
const TS = firebase.database.ServerValue.TIMESTAMP;

const VIDEO_MAX = 6 * 1024 * 1024; // максимум 6 МБ на видео (в базе оно хранится как base64)

/* ---------- ХРАНИЛИЩЕ НАСТРОЕК ---------- */
const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

/* ---------- ЯЗЫКИ ---------- */
const LANGS = { ru: 'Русский', en: 'English' };
const I18N = {
    ru: {
        nickTitle: 'Введите ник', nickPh: 'Ник...', enter: 'Войти →', chatsTitle: 'Чаты', settings: 'Настройки',
        general: 'Общий чат', allUsers: 'Все пользователи',
        noPm: 'Личных переписок пока нет.\nНажмите на ник в общем чате → «Написать».',
        firstMsg: 'Напишите первое сообщение', noMsgs: 'Сообщений пока нет. Напишите первым 🙂', msgPh: 'Сообщение...',
        you: 'Вы', youPrefix: 'Вы: ', photo: '📷 Фото', sticker: 'Стикер', photoMissing: '📷 Фото недоступно',
        video: '🎥 Видео', videoWord: 'Видео', plusVideo: 'Видео', videoTooBig: 'Видео больше 6 МБ. Обрежь или сожми его',
        needVideo: 'Нужен видеофайл', videoFail: 'Не удалось обработать видео', videoNotSent: 'Видео не отправлено: ',
        videoLoadFail: 'Не удалось загрузить видео', avatarEd: 'Аватар',
        anon: 'Аноним', peer: 'Собеседник', typing: 'печатает…', online: 'в сети', offline: 'не в сети',
        justNow: 'был(а) только что', minAgo: 'был(а) {n} мин назад', hrAgo: 'был(а) {n} ч назад',
        dayAgo: 'был(а) {n} дн назад', seenAt: 'был(а) {d}', yesterday: 'Вчера', edited: 'изменено',
        reply: 'Ответить', copy: 'Копировать', download: 'Скачать', edit: 'Изменить', hideMe: 'Скрыть у себя',
        delAll: 'Удалить у всех', cancel: 'Отмена', close: 'Закрыть', save: 'Сохранить', copied: 'Скопировано',
        delConfirm: 'Удалить это сообщение у всех?', hiddenToast: 'Скрыто у вас', deletedAll: 'Удалено у всех',
        empty: 'Пусто', notFound: 'Сообщение не найдено', cantSelf: 'Нельзя написать самому себе',
        errAccess: 'Нет доступа к базе. Проверьте Rules в Firebase.', errAnon: 'Включите нужный способ входа в Authentication → Sign-in method.',
        errUnknown: 'Неизвестная ошибка', notSent: 'Не отправлено: ', photoNotSent: 'Фото не отправлено: ',
        needImage: 'Нужно изображение', tooBig: 'Файл больше 30 МБ',
        delChatTitle: 'Удалить чат?', delChatWith: 'Чат с', delBoth: 'Удалить у обоих', delMeOnly: 'Убрать только у себя',
        delBothConfirm: 'Удалить переписку у обоих? Это нельзя отменить.', chatHidden: 'Чат убран у вас', chatDeleted: 'Чат удалён у обоих',
        account: 'Аккаунт', custom: 'Кастомизация', language: 'Язык', moderator: 'Модератор',
        pickSection: 'Выберите раздел слева, чтобы настроить', nick: 'Ник', bio: 'О себе', loc: 'Откуда',
        uploadPhoto: '📷 Загрузить фото', uploading: 'Загрузка...', photoUpdated: 'Фото обновлено', saved: 'Сохранено',
        followers: 'Подписчики', following: 'Подписки', newAccount: 'Новый аккаунт', deleteAccount: 'Удалить аккаунт',
        newAccConfirm: 'Выйти и создать новый аккаунт? Текущий аккаунт и его чаты станут недоступны.',
        nickEmpty: 'Ник пустой', nickEnter: 'Введите ник', nickMax: 'Максимум 20 символов', errPrefix: 'Ошибка: ',
        theme: 'Тема', light: 'Светлая', dark: 'Тёмная', color: 'Цвет', chatBg: 'Фон чата', pickPhoto: 'Выбрать фото',
        clearBg: 'Убрать фон', bgHint: 'Фон виден только вам и хранится на этом устройстве.', noBg: 'Фон не выбран',
        bgSet: 'Фон установлен', bgCleared: 'Фон убран', noSpace: 'Не хватило места на устройстве',
        uiScale: 'Масштаб интерфейса', textSize: 'Размер текста', textSample: 'Так выглядит текст сообщений',
        delTitle: 'Удалить аккаунт?', delWarn: 'Профиль, фото, подписки и список чатов будут удалены без возможности восстановления. Отправленные сообщения останутся в чатах.',
        yes: 'Да', no: 'Нет', accDeleted: 'Аккаунт удалён',
        profile: 'Профиль', subscribe: '➕ Подписаться', subscribed: '✓ Вы подписаны', subOn: 'Подписались', subOff: 'Отписались',
        write: '💬 Написать', nothingTold: 'Ничего не рассказал', removeFollower: 'Удалить подписчика?', followerRemoved: 'Подписчик удалён',
        clearGeneral: '🗑️ Очистить общий чат', clearConfirm: 'Очистить ВЕСЬ общий чат?', cleared: 'Чат очищен',
        rotate: 'Повернуть', back: 'Вернуть назад', rewrite: 'Переписать', captionPh: 'Подпись...', send: 'Отправить',
        cancelEd: 'Отмена', photoWord: 'Фото', stickerEd: 'Стикер',
        plusPhoto: 'Фото', plusSticker: 'Создать стикер', stickers: 'Стикеры',
        stkEmpty: 'Здесь пока пусто', favAdd: 'В избранные', favRemove: 'Убрать из избранных', favAdded: 'Добавлено в избранные',
        favRemoved: 'Убрано из избранных', favLimit: 'В избранных может быть до 15 стикеров', openPack: 'Открыть пак',
        addPack: 'Добавить пак себе', removePack: 'Убрать пак', deletePack: 'Удалить пак', packAdded: 'Пак добавлен', packRemoved: 'Пак убран',
        packGone: 'Пак не найден', stkDelete: 'Удалить стикер', stkDeleted: 'Стикер удалён', justSticker: 'Просто стикер',
        makePack: 'Стикерпак', packName: 'Название пака', newPack: 'Новый пак', stkSaved: 'Стикер сохранён', needPackName: 'Введите название пака',
        stickerCount: '{n} шт.', packsOf: 'Пак',
        authTitleIn: 'Вход', authTitleUp: 'Регистрация', authSub: 'Войдите, чтобы пользоваться чатом',
        email: 'Почта', password: 'Пароль', password2: 'Повторите пароль', signIn: 'Войти', signUp: 'Создать аккаунт',
        toSignUp: 'Нет аккаунта? Зарегистрироваться', toSignIn: 'Уже есть аккаунт? Войти', forgot: 'Забыли пароль?',
        or: 'или', google: 'Продолжить с Google', resetAsk: 'Введите почту, чтобы получить письмо для сброса пароля',
        resetSent: 'Письмо для сброса пароля отправлено', signOut: 'Выйти из аккаунта', signOutConfirm: 'Выйти из аккаунта?',
        signOutGuest: 'Вы в гостевом аккаунте. Если выйти, он и его чаты будут потеряны. Сначала привяжите почту или Google в настройках. Всё равно выйти?',
        passMismatch: 'Пароли не совпадают', fillAll: 'Введите почту и пароль',
        linkTitle: 'Сохраните аккаунт', linkHint: 'Сейчас вы в гостевом аккаунте. Привяжите почту или Google, и чаты не потеряются при выходе или смене устройства.',
        linkEmail: 'Привязать почту', linked: 'Аккаунт привязан', verifySent: 'Отправили письмо для подтверждения почты',
        eEmail: 'Некорректная почта', eCred: 'Неверная почта или пароль', eInUse: 'Эта почта уже используется',
        eWeak: 'Слишком простой пароль (минимум 6 символов)', eMany: 'Слишком много попыток, попробуйте позже', eNet: 'Нет сети',
        eDomain: 'Домен сайта не добавлен в Firebase → Authentication → Settings → Authorized domains',
        eRecent: 'Войдите заново и повторите', reauthPass: 'Введите пароль для подтверждения'
    },
    en: {
        nickTitle: 'Enter a nickname', nickPh: 'Nickname...', enter: 'Sign in →', chatsTitle: 'Chats', settings: 'Settings',
        general: 'General chat', allUsers: 'All users',
        noPm: 'No private chats yet.\nTap a nickname in the general chat → “Message”.',
        firstMsg: 'Write the first message', noMsgs: 'No messages yet. Be the first 🙂', msgPh: 'Message...',
        you: 'You', youPrefix: 'You: ', photo: '📷 Photo', sticker: 'Sticker', photoMissing: '📷 Photo unavailable',
        video: '🎥 Video', videoWord: 'Video', plusVideo: 'Video', videoTooBig: 'Video is larger than 6 MB. Trim or compress it',
        needVideo: 'A video file is required', videoFail: 'Could not process the video', videoNotSent: 'Video not sent: ',
        videoLoadFail: 'Could not load the video', avatarEd: 'Avatar',
        anon: 'Anonymous', peer: 'Contact', typing: 'typing…', online: 'online', offline: 'offline',
        justNow: 'last seen just now', minAgo: 'last seen {n} min ago', hrAgo: 'last seen {n} h ago',
        dayAgo: 'last seen {n} d ago', seenAt: 'last seen {d}', yesterday: 'Yesterday', edited: 'edited',
        reply: 'Reply', copy: 'Copy', download: 'Download', edit: 'Edit', hideMe: 'Hide for me',
        delAll: 'Delete for everyone', cancel: 'Cancel', close: 'Close', save: 'Save', copied: 'Copied',
        delConfirm: 'Delete this message for everyone?', hiddenToast: 'Hidden for you', deletedAll: 'Deleted for everyone',
        empty: 'Empty', notFound: 'Message not found', cantSelf: "You can't message yourself",
        errAccess: 'No access to the database. Check Rules in Firebase.', errAnon: 'Enable this sign-in method in Authentication → Sign-in method.',
        errUnknown: 'Unknown error', notSent: 'Not sent: ', photoNotSent: 'Photo not sent: ',
        needImage: 'An image is required', tooBig: 'File is larger than 30 MB',
        delChatTitle: 'Delete chat?', delChatWith: 'Chat with', delBoth: 'Delete for both', delMeOnly: 'Remove for me only',
        delBothConfirm: 'Delete the conversation for both? This cannot be undone.', chatHidden: 'Chat removed for you', chatDeleted: 'Chat deleted for both',
        account: 'Account', custom: 'Customization', language: 'Language', moderator: 'Moderator',
        pickSection: 'Choose a section on the left to configure', nick: 'Nickname', bio: 'About', loc: 'Location',
        uploadPhoto: '📷 Upload photo', uploading: 'Uploading...', photoUpdated: 'Photo updated', saved: 'Saved',
        followers: 'Followers', following: 'Following', newAccount: 'New account', deleteAccount: 'Delete account',
        newAccConfirm: 'Sign out and create a new account? The current account and its chats will become unavailable.',
        nickEmpty: 'Nickname is empty', nickEnter: 'Enter a nickname', nickMax: 'Maximum 20 characters', errPrefix: 'Error: ',
        theme: 'Theme', light: 'Light', dark: 'Dark', color: 'Color', chatBg: 'Chat background', pickPhoto: 'Choose photo',
        clearBg: 'Remove background', bgHint: 'Only you can see the background; it is stored on this device.', noBg: 'No background',
        bgSet: 'Background set', bgCleared: 'Background removed', noSpace: 'Not enough space on the device',
        uiScale: 'Interface scale', textSize: 'Text size', textSample: 'This is how message text looks',
        delTitle: 'Delete account?', delWarn: 'Your profile, photo, subscriptions and chat list will be deleted permanently. Messages you sent will stay in the chats.',
        yes: 'Yes', no: 'No', accDeleted: 'Account deleted',
        profile: 'Profile', subscribe: '➕ Follow', subscribed: '✓ Following', subOn: 'Followed', subOff: 'Unfollowed',
        write: '💬 Message', nothingTold: 'Nothing here yet', removeFollower: 'Remove follower?', followerRemoved: 'Follower removed',
        clearGeneral: '🗑️ Clear general chat', clearConfirm: 'Clear the ENTIRE general chat?', cleared: 'Chat cleared',
        rotate: 'Rotate', back: 'Reset', rewrite: 'Rewrite', captionPh: 'Caption...', send: 'Send',
        cancelEd: 'Cancel', photoWord: 'Photo', stickerEd: 'Sticker',
        plusPhoto: 'Photo', plusSticker: 'Create sticker', stickers: 'Stickers',
        stkEmpty: 'Nothing here yet', favAdd: 'Add to favorites', favRemove: 'Remove from favorites', favAdded: 'Added to favorites',
        favRemoved: 'Removed from favorites', favLimit: 'Up to 15 favorite stickers', openPack: 'Open pack',
        addPack: 'Add pack', removePack: 'Remove pack', deletePack: 'Delete pack', packAdded: 'Pack added', packRemoved: 'Pack removed',
        packGone: 'Pack not found', stkDelete: 'Delete sticker', stkDeleted: 'Sticker deleted', justSticker: 'Single sticker',
        makePack: 'Sticker pack', packName: 'Pack name', newPack: 'New pack', stkSaved: 'Sticker saved', needPackName: 'Enter a pack name',
        stickerCount: '{n} pcs', packsOf: 'Pack',
        authTitleIn: 'Sign in', authTitleUp: 'Sign up', authSub: 'Sign in to use the chat',
        email: 'Email', password: 'Password', password2: 'Repeat password', signIn: 'Sign in', signUp: 'Create account',
        toSignUp: "Don't have an account? Sign up", toSignIn: 'Already have an account? Sign in', forgot: 'Forgot password?',
        or: 'or', google: 'Continue with Google', resetAsk: 'Enter your email to get a password reset link',
        resetSent: 'Password reset email sent', signOut: 'Sign out', signOutConfirm: 'Sign out?',
        signOutGuest: 'You are in a guest account. If you sign out, it and its chats will be lost. Link an email or Google in settings first. Sign out anyway?',
        passMismatch: 'Passwords do not match', fillAll: 'Enter email and password',
        linkTitle: 'Save your account', linkHint: 'You are in a guest account. Link an email or Google so your chats are not lost when you sign out or switch devices.',
        linkEmail: 'Link email', linked: 'Account linked', verifySent: 'Verification email sent',
        eEmail: 'Invalid email', eCred: 'Wrong email or password', eInUse: 'This email is already in use',
        eWeak: 'Password is too weak (min 6 characters)', eMany: 'Too many attempts, try later', eNet: 'No network',
        eDomain: 'Site domain is not in Firebase → Authentication → Settings → Authorized domains',
        eRecent: 'Sign in again and retry', reauthPass: 'Enter your password to confirm'
    }
};
const DAYS = { ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
let lang = store.get('lang', 'ru'); if (!LANGS[lang]) lang = 'ru';
const t = (k, v) => {
    let s = (I18N[lang] && I18N[lang][k]) ?? I18N.ru[k] ?? k;
    if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]);
    return s;
};

/* ---------- СОСТОЯНИЕ ---------- */
let me = null, myNick = '', isAdmin = false, startedUid = null;
let chat = null, replyTo = null;
let myChats = {}, chatsRef = null;
let serverOffset = 0, amTyping = null, typingTimer = null, lastPing = 0;
let pendingVid = null;
const userCache = {}, avatarCache = {}, imageCache = {}, videoUrls = {};
const A = {};                         // обработчики data-act
const COLORS = ['default', 'blue', 'green', 'pink', 'purple', 'orange', 'red', 'teal'];
const SET = { open: false, sec: null };
const stk = { open: false, tab: 'recent', loaded: false, data: { fav: {}, own: {}, packs: {} } };

/* ---------- ИКОНКИ (цвет берут из темы) ---------- */
const svg = (inner, sz = 22) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const ICON = {
    user: svg('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    globe: svg('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
    image: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
    smile: svg('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>'),
    video: svg('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>'),
    check: svg('<polyline points="20 6 9 17 4 12"/>', 18)
};

/* ---------- УТИЛИТЫ ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const roomId = (a, b) => 'pm_' + [a, b].sort().join('_');
const initial = n => esc(((n || '?').trim()[0] || '?').toUpperCase());
const pad = n => String(n).padStart(2, '0');
const hhmm = ts => { const d = new Date(ts); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const fmtDur = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + pad(s % 60); };
function toast(msg) {
    let el = $('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2500);
}
function hideLoading() {
    const l = $('loadingScreen'); if (!l) return;
    l.classList.add('hide'); setTimeout(() => { if (l.classList.contains('hide')) l.style.display = 'none'; }, 500);
}
function fatal(msg) {
    const l = $('loadingScreen'); if (!l) return alert(msg);
    l.style.display = 'flex'; l.classList.remove('hide');
    $('loadingText').textContent = msg;
}
function errText(e) {
    const c = (e && (e.code || e.message)) || '';
    if (/PERMISSION_DENIED|permission/i.test(c)) return t('errAccess');
    if (/operation-not-allowed/.test(c)) return t('errAnon');
    return (e && e.message) || t('errUnknown');
}

/* ---------- МОДАЛКИ ---------- */
function showModal(html, id = 'modal') {
    closeModal(id);
    const m = document.createElement('div');
    m.className = 'profile-modal'; m.id = id;
    m.innerHTML = `<div class="profile-modal-content">${html}</div>`;
    m.addEventListener('click', e => { if (e.target === m) closeModal(id); });
    document.body.appendChild(m);
    return m;
}
function closeModal(id = 'modal') {
    const m = $(id); if (!m) return;
    try { m._onClose && m._onClose(); } catch (e) {}
    m.remove();
}
const setModal = (m, html) => { m.firstElementChild.innerHTML = html; };
A.closeModal = el => closeModal(el.dataset.modal || 'modal');

/* ---------- ДЕЛЕГИРОВАНИЕ КЛИКОВ ---------- */
document.addEventListener('click', e => {
    if (!e.target.closest('.plus-menu, #plusBtn')) closePlus();
    const el = e.target.closest('[data-act]');
    if (el && A[el.dataset.act]) A[el.dataset.act](el, e);
});
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if ($('msgMenuLayer')) return closeMsgMenu();
    if ($('viewer')) return closeViewer();
    if ($('photoEditor')) return closePhotoEditor();
    const ms = document.querySelectorAll('.profile-modal');
    if (ms.length) return closeModal(ms[ms.length - 1].id);
    if (SET.open) A.closeSettings();
});
document.addEventListener('change', e => {
    if (e.target.id === 'packSel') $('packName').style.display = e.target.value === 'new' ? '' : 'none';
});
document.addEventListener('input', e => {
    if (e.target.id === 'rngZoom') { store.set('uiScale', e.target.value); applyScale(); }
    if (e.target.id === 'rngFont') { store.set('textSize', e.target.value); applyScale(); }
});

/* ---------- ДОЛГОЕ НАЖАТИЕ ---------- */
function longPress(box, sel, cb, ms = 480) {
    let timer = null, sx = 0, sy = 0, fired = false;
    const start = e => {
        const el = e.target.closest(sel); if (!el || !box.contains(el)) return;
        const p = e.touches ? e.touches[0] : e; sx = p.clientX; sy = p.clientY; fired = false;
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null; fired = true; setTimeout(() => { fired = false; }, 700);
            if (navigator.vibrate) navigator.vibrate(35);
            cb(el, sx, sy);
        }, ms);
    };
    const cancel = () => { clearTimeout(timer); timer = null; };
    box.addEventListener('touchstart', start, { passive: true });
    box.addEventListener('touchmove', e => { const p = e.touches[0]; if (Math.abs(p.clientX - sx) > 10 || Math.abs(p.clientY - sy) > 10) cancel(); }, { passive: true });
    box.addEventListener('touchend', cancel); box.addEventListener('touchcancel', cancel);
    box.addEventListener('mousedown', e => { if (e.button === 0) start(e); });
    box.addEventListener('mouseup', cancel); box.addEventListener('mouseleave', cancel);
    box.addEventListener('contextmenu', e => {
        const el = e.target.closest(sel); if (!el || !box.contains(el)) return;
        e.preventDefault(); cancel(); fired = true; setTimeout(() => { fired = false; }, 700); cb(el, e.clientX, e.clientY);
    });
    box.addEventListener('click', e => { if (fired) { e.stopPropagation(); e.preventDefault(); fired = false; } }, true);
}

/* ---------- ТЕМА / МАСШТАБ / ЯЗЫК ---------- */
function applyTheme() {
    const th = store.get('chatTheme', 'light'), c = store.get('chatColor', 'default'), b = document.body;
    b.classList.toggle('dark', th === 'dark'); b.classList.toggle('light', th !== 'dark');
    COLORS.forEach(x => b.classList.remove('color-' + x)); b.classList.add('color-' + c);
    document.querySelectorAll('[data-theme]').forEach(e => e.classList.toggle('active', e.dataset.theme === th));
    document.querySelectorAll('[data-color]').forEach(e => e.classList.toggle('active', e.dataset.color === c));
}
A.theme = el => { store.set('chatTheme', el.dataset.theme); applyTheme(); };
A.color = el => { store.set('chatColor', el.dataset.color); applyTheme(); };
function applyScale() {
    const z = Math.min(1.3, Math.max(0.8, (+store.get('uiScale', '100') || 100) / 100));
    const f = Math.min(22, Math.max(12, +store.get('textSize', '15') || 15));
    const r = document.documentElement.style;
    r.setProperty('--z', z); r.setProperty('--msg-font', f + 'px');
    if ($('zVal')) $('zVal').textContent = Math.round(z * 100) + '%';
    if ($('fVal')) $('fVal').textContent = f + ' px';
}
function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach(e => { e.placeholder = t(e.dataset.i18nPh); });
    if (startedUid) {
        renderChats();
        if (chat) { $('chatTitle').textContent = chat.kind === 'chat' ? '💬 ' + t('general') : $('chatTitle').textContent; updateHeaderStatus(true); }
        if (stk.open) renderStk();
    }
    if (SET.open) { buildSide(); showSection(SET.sec); }
    try { auth.languageCode = lang; } catch (e) {}
    if ($('authScreen') && $('authScreen').style.display !== 'none') renderAuth();
}
A.setLang = el => { lang = el.dataset.lang; store.set('lang', lang); applyLang(); };

/* ---------- КАРТИНКИ ---------- */
const readFile = f => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error('read')); r.readAsDataURL(f);
});
const loadImage = src => new Promise((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('image')); i.src = src;
});
async function shrink(src, max, q, square, mime = 'image/jpeg') {
    const im = await loadImage(src);
    let sx = 0, sy = 0, sw = im.width, sh = im.height;
    if (square) { const s = Math.min(sw, sh); sx = (sw - s) / 2; sy = (sh - s) / 2; sw = sh = s; }
    const k = Math.min(1, max / Math.max(sw, sh));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(sw * k)); c.height = Math.max(1, Math.round(sh * k));
    const x = c.getContext('2d');
    if (mime === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
    x.drawImage(im, sx, sy, sw, sh, 0, 0, c.width, c.height);
    return c.toDataURL(mime, q);
}
function pickFile(accept) {
    return new Promise(res => {
        const i = $('filePicker'); i.value = ''; i.accept = accept;
        i.onchange = () => res(i.files[0] || null);
        i.click();
    });
}
async function pickImage() {
    const f = await pickFile('image/*'); if (!f) return null;
    if (!f.type.startsWith('image/')) { toast(t('needImage')); return null; }
    if (f.size > 30 * 1024 * 1024) { toast(t('tooBig')); return null; }
    return f;
}
async function pickVideo() {
    const f = await pickFile('video/*'); if (!f) return null;
    if (!f.type.startsWith('video/')) { toast(t('needVideo')); return null; }
    if (f.size > VIDEO_MAX) { toast(t('videoTooBig')); return null; }
    return f;
}
function getImage(id) {
    if (!imageCache[id]) {
        imageCache[id] = db.ref('images/' + id).once('value').then(s => {
            const v = s.val(); if (!v) throw new Error('none'); return v;
        }).catch(e => { delete imageCache[id]; throw e; });
    }
    return imageCache[id];
}
function getVideoUrl(id) {
    if (!videoUrls[id]) {
        videoUrls[id] = db.ref('images/' + id).once('value').then(async s => {
            const v = s.val(); if (!v) throw new Error('none');
            const blob = await (await fetch(v)).blob();
            return URL.createObjectURL(blob);
        }).catch(e => { delete videoUrls[id]; throw e; });
    }
    return videoUrls[id];
}
function getAvatar(uid, fresh) {
    const c = avatarCache[uid];
    if (!fresh && c && Date.now() - c.t < 300000) return c.p;
    const p = db.ref('avatars/' + uid).once('value').then(s => s.val() || '').catch(() => '');
    avatarCache[uid] = { t: Date.now(), p };
    return p;
}
function getUser(uid, fresh) {
    const c = userCache[uid];
    if (!fresh && c && Date.now() - c.t < 20000) return c.p;
    const p = Promise.all([db.ref('users/' + uid).once('value'), getAvatar(uid)])
        .then(([u, a]) => ({ ...(u.val() || {}), avatar: a })).catch(() => ({}));
    userCache[uid] = { t: Date.now(), p };
    return p;
}
const avatarInner = (url, nick) => url ? `<img src="${esc(url)}" alt="">` : initial(nick);
function fillImg(img, imageId, onFail) {
    getImage(imageId).then(u => { img.src = u; }, onFail || (() => {}));
}

/* кадр-превью и длительность видео */
function videoMeta(url) {
    return new Promise((res, rej) => {
        const v = document.createElement('video');
        v.preload = 'metadata'; v.muted = true; v.playsInline = true;
        let done = false;
        const fail = () => { if (!done) { done = true; rej(new Error('video')); } };
        v.onerror = fail;
        v.onloadedmetadata = () => { try { v.currentTime = Math.min(0.1, (v.duration || 1) / 2); } catch (e) { fail(); } };
        v.onseeked = () => {
            if (done) return; done = true;
            const w = v.videoWidth || 320, h = v.videoHeight || 240;
            const k = Math.min(1, 320 / Math.max(w, h));
            const c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
            c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
            res({ thumb: c.toDataURL('image/jpeg', 0.6), dur: Math.round(v.duration) || 0 });
        };
        v.src = url;
        setTimeout(fail, 8000);
    });
}

/* ---------- ПРОСМОТР ФОТО ---------- */
function openViewer(src) {
    if (!src || $('viewer')) return;
    const v = document.createElement('div');
    v.className = 'avatar-viewer'; v.id = 'viewer';
    v.innerHTML = '<button class="avatar-viewer-close" data-act="closeViewer">✕</button><img alt="">';
    v.querySelector('img').src = src;
    v.addEventListener('click', closeViewer);
    document.body.appendChild(v);
    requestAnimationFrame(() => v.classList.add('show'));
}
function closeViewer() {
    const v = $('viewer'); if (!v) return;
    v.classList.remove('show'); setTimeout(() => v.remove(), 250);
}
A.closeViewer = closeViewer;
A.viewImg = el => openViewer(el.src);
A.viewAvatar = el => { const i = el.querySelector('img'); if (i) openViewer(i.src); };

/* ---------- АВТОРИЗАЦИЯ ---------- */
db.ref('.info/serverTimeOffset').on('value', s => { serverOffset = s.val() || 0; });
auth.getRedirectResult().catch(e => { const m = authErr(e); if (m) toast(m); });
auth.onAuthStateChanged(async user => {
    if (!user) {
        if (startedUid) resetSession();
        me = null; myNick = '';
        ['chatsScreen', 'chatContainer', 'settings', 'nicknameModal'].forEach(id => { $(id).style.display = 'none'; });
        renderAuth('in'); hideLoading();
        return;
    }
    me = user;
    $('authScreen').style.display = 'none';
    try {
        const d = (await db.ref('users/' + user.uid).once('value')).val();
        if (d && d.nickname) { myNick = d.nickname; enterApp(); }
        else {
            $('chatsScreen').style.display = 'none'; $('chatContainer').style.display = 'none'; $('settings').style.display = 'none';
            $('nicknameInput').value = (user.displayName || '').slice(0, 20);
            $('nicknameModal').style.display = 'flex';
        }
        hideLoading();
    } catch (e) { console.error(e); fatal(errText(e)); }
});
/* ---------- ВХОД ПО ПОЧТЕ / GOOGLE ---------- */
let authMode = 'in', authBusy = false;
const GOOGLE_SVG = '<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
const gProvider = () => { const p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); return p; };
const popupFallback = e => /popup-blocked|operation-not-supported|web-storage-unsupported/.test((e && e.code) || '');
function authErr(e) {
    const c = (e && e.code) || '';
    if (/popup-closed-by-user|cancelled-popup-request|user-cancelled/.test(c)) return '';
    if (c === 'auth/invalid-email') return t('eEmail');
    if (/user-not-found|wrong-password|invalid-credential|invalid-login-credentials/.test(c)) return t('eCred');
    if (/email-already-in-use|credential-already-in-use|provider-already-linked/.test(c)) return t('eInUse');
    if (c === 'auth/weak-password') return t('eWeak');
    if (c === 'auth/too-many-requests') return t('eMany');
    if (c === 'auth/network-request-failed') return t('eNet');
    if (c === 'auth/unauthorized-domain') return t('eDomain');
    if (c === 'auth/requires-recent-login') return t('eRecent');
    return errText(e);
}
function renderAuth(mode) {
    if (mode) authMode = mode;
    const up = authMode === 'up', el = $('authScreen');
    const prev = $('authEmail') ? $('authEmail').value : '';
    el.innerHTML = `<div class="modal-content auth-box">
        <h3>${esc(up ? t('authTitleUp') : t('authTitleIn'))}</h3>
        <p class="muted">${esc(t('authSub'))}</p>
        <input type="email" id="authEmail" placeholder="${esc(t('email'))}" autocomplete="email" inputmode="email">
        <input type="password" id="authPass" placeholder="${esc(t('password'))}" autocomplete="${up ? 'new-password' : 'current-password'}">
        ${up ? `<input type="password" id="authPass2" placeholder="${esc(t('password2'))}" autocomplete="new-password">` : ''}
        <button id="authBtn" data-act="authSubmit">${esc(up ? t('signUp') : t('signIn'))}</button>
        ${up ? '' : `<a class="auth-link" data-act="authForgot">${esc(t('forgot'))}</a>`}
        <div class="auth-or">${esc(t('or'))}</div>
        <button class="google-btn" data-act="authGoogle">${GOOGLE_SVG}<span>${esc(t('google'))}</span></button>
        <a class="auth-link" data-act="authToggle">${esc(up ? t('toSignIn') : t('toSignUp'))}</a>
        <div class="auth-lang">${Object.entries(LANGS).map(([c, n]) => `<button data-act="setLang" data-lang="${c}" class="${lang === c ? 'active' : ''}">${esc(n)}</button>`).join('')}</div>
    </div>`;
    $('authEmail').value = prev;
    el.style.display = 'flex';
}
async function authRun(fn) {
    if (authBusy) return;
    authBusy = true; const b = $('authBtn'); if (b) b.disabled = true;
    try { await fn(); } catch (e) { const m = authErr(e); if (m) toast(m); }
    authBusy = false; if ($('authBtn')) $('authBtn').disabled = false;
}
A.authToggle = () => renderAuth(authMode === 'in' ? 'up' : 'in');
A.authSubmit = () => authRun(async () => {
    const em = $('authEmail').value.trim(), pw = $('authPass').value;
    if (!em || !pw) return toast(t('fillAll'));
    if (authMode === 'up') {
        if (pw !== $('authPass2').value) return toast(t('passMismatch'));
        const cr = await auth.createUserWithEmailAndPassword(em, pw);
        cr.user.sendEmailVerification().then(() => toast(t('verifySent'))).catch(() => {});
    } else await auth.signInWithEmailAndPassword(em, pw);
});
A.authGoogle = () => authRun(async () => {
    try { await auth.signInWithPopup(gProvider()); }
    catch (e) { if (popupFallback(e)) { await auth.signInWithRedirect(gProvider()); return; } throw e; }
});
A.authForgot = () => authRun(async () => {
    const em = $('authEmail').value.trim();
    if (!em) return toast(t('resetAsk'));
    await auth.sendPasswordResetEmail(em); toast(t('resetSent'));
});
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && ['authEmail', 'authPass', 'authPass2'].includes(e.target.id)) { e.preventDefault(); A.authSubmit(); }
});

async function reauth(user) {
    if (user.isAnonymous) return true;
    const ids = user.providerData.map(p => p.providerId);
    if (ids.includes('google.com')) { await user.reauthenticateWithPopup(gProvider()); return true; }
    if (ids.includes('password')) {
        const pw = prompt(t('reauthPass')); if (!pw) return false;
        await user.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(user.email, pw));
    }
    return true;
}

async function saveNickname() {
    const n = $('nicknameInput').value.trim();
    if (!n) return toast(t('nickEnter'));
    if (n.length > 20) return toast(t('nickMax'));
    if (!me) return;
    try {
        await db.ref('users/' + me.uid).set({ nickname: n, joined: Date.now(), messageCount: 0, bio: '', location: '', online: true, lastSeen: Date.now() });
        myNick = n; enterApp();
    } catch (e) { toast(t('errPrefix') + errText(e)); }
}
function enterApp() {
    if (startedUid === me.uid) return;
    startedUid = me.uid;
    $('nicknameModal').style.display = 'none';
    showScreen('chats');
    initPresence();
    db.ref('admins/' + me.uid).once('value').then(s => { isAdmin = s.val() === true; if (SET.open) buildSide(); }).catch(() => {});
    listenChats();
    migrateChats();
    stk.loaded = false;
}
function showScreen(name) {
    $('chatsScreen').style.display = name === 'chats' ? 'flex' : 'none';
    $('chatContainer').style.display = name === 'chat' ? 'flex' : 'none';
}
function resetSession() {
    closeChat(); closeStickers();
    if (chatsRef) chatsRef.off();
    db.ref('.info/connected').off();
    startedUid = null; isAdmin = false; myChats = {};
    $('settings').style.display = 'none'; SET.open = false;
}
async function doSignOut() {
    const uid = me && me.uid, started = !!uid && startedUid === uid;
    if (started) {
        resetSession();
        try {
            await db.ref('users/' + uid).update({ online: false, lastSeen: Date.now() });
            db.ref(`users/${uid}/online`).onDisconnect().cancel(); db.ref(`users/${uid}/lastSeen`).onDisconnect().cancel();
        } catch (e) {}
    }
    try { await auth.signOut(); } catch (e) { location.reload(); }
}
A.signOut = async () => { if (confirm(me && me.isAnonymous ? t('signOutGuest') : t('signOutConfirm'))) await doSignOut(); };
A.signOutQuick = () => doSignOut();

/* ---------- ПРИСУТСТВИЕ ---------- */
function initPresence() {
    const ref = db.ref('users/' + me.uid);
    db.ref('.info/connected').on('value', s => {
        if (s.val() !== true) return;
        ref.child('online').onDisconnect().set(false);
        ref.child('lastSeen').onDisconnect().set(TS);
        ref.update({ online: document.visibilityState === 'visible', lastSeen: TS });
    });
}
document.addEventListener('visibilitychange', () => {
    if (!me || startedUid !== me.uid) return;
    const vis = document.visibilityState === 'visible';
    db.ref('users/' + me.uid).update({ online: vis, lastSeen: TS }).catch(() => {});
    if (vis) markRead(); else stopTyping();
});
function fmtStatus(d) {
    if (!d || !d.nickname) return ['', 'offline'];
    if (d.online === true) return ['🟢 ' + t('online'), 'online'];
    const ls = d.lastSeen || 0;
    if (!ls) return ['⚫ ' + t('offline'), 'offline'];
    const min = Math.floor((Date.now() - ls) / 60000), hr = Math.floor(min / 60), dy = Math.floor(hr / 24);
    if (min < 2) return ['⚫ ' + t('justNow'), 'offline'];
    if (min < 60) return ['⚫ ' + t('minAgo', { n: min }), 'offline'];
    if (hr < 24) return ['⚫ ' + t('hrAgo', { n: hr }), 'offline'];
    if (dy < 7) return ['⚫ ' + t('dayAgo', { n: dy }), 'offline'];
    return ['⚫ ' + t('seenAt', { d: new Date(ls).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB') }), 'offline'];
}

/* ---------- СПИСОК ЧАТОВ ---------- */
function listenChats() {
    if (chatsRef) chatsRef.off();
    chatsRef = db.ref('user_chats/' + me.uid);
    chatsRef.on('value', s => {
        myChats = s.val() || {};
        renderChats();
        if (chat && chat.kind === 'pm') markRead();
    }, e => toast(errText(e)));
}
function formatChatTime(ts) {
    const d = new Date(ts), n = new Date(), day = 864e5;
    if (d.toDateString() === n.toDateString()) return hhmm(ts);
    if (n - d < 2 * day) return t('yesterday');
    if (n - d < 7 * day) return DAYS[lang][d.getDay()];
    return `${d.getDate()}.${pad(d.getMonth() + 1)}`;
}
function renderChats() {
    const list = $('chatsList'); if (!list) return;
    const rows = Object.entries(myChats).map(([uid, c]) => ({ uid, ...c })).sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));
    let html = `<div class="chat-item-wrapper"><div class="chat-item" data-act="openGeneral">
        <div class="chat-item-avatar">💬</div>
        <div class="chat-item-info"><div class="chat-item-name">${esc(t('general'))}</div><div class="chat-item-last">${esc(t('allUsers'))}</div></div></div></div>`;
    if (!rows.length) html += `<div class="empty-note">${esc(t('noPm'))}</div>`;
    rows.forEach(c => {
        let prev = c.lastSticker ? '🖼 ' + t('sticker') : c.lastVideo ? t('video') + (c.lastText ? ' ' + c.lastText : '') : c.lastImage ? t('photo') + (c.lastText ? ' ' + c.lastText : '') : (c.lastText || '...');
        if (prev.length > 40) prev = prev.slice(0, 40) + '…';
        if (c.lastFrom === me.uid) prev = t('youPrefix') + prev;
        html += `<div class="chat-item-wrapper" data-uid="${esc(c.uid)}">
            <div class="chat-item" data-act="openPm" data-uid="${esc(c.uid)}">
                <div class="chat-item-avatar" data-av="${esc(c.uid)}">?</div>
                <div class="chat-item-info"><div class="chat-item-name" data-nm="${esc(c.uid)}">…</div>
                <div class="chat-item-last">${esc(prev)}</div></div>
                <div class="chat-item-side"><span class="chat-item-time">${c.lastTime ? formatChatTime(c.lastTime) : ''}</span>
                ${c.unread > 0 ? `<span class="chat-item-unread">${c.unread}</span>` : ''}</div>
            </div></div>`;
    });
    list.innerHTML = html;
    fillChatRows();
}
function fillChatRows() {
    document.querySelectorAll('#chatsList [data-av]').forEach(av => {
        getUser(av.dataset.av).then(u => {
            if (!av.isConnected) return;
            av.innerHTML = avatarInner(u.avatar, u.nickname) + (u.online === true ? '<span class="online-badge"></span>' : '');
            const nm = av.parentElement.querySelector('[data-nm]');
            if (nm) nm.textContent = u.nickname || t('anon');
        });
    });
}
setInterval(() => { if ($('chatsScreen').style.display !== 'none') fillChatRows(); }, 20000);
longPress($('chatsList'), '.chat-item-wrapper[data-uid]', el => askDeleteChat(el.dataset.uid), 600);

async function askDeleteChat(uid) {
    const u = await getUser(uid);
    showModal(`<h3>🗑️ ${esc(t('delChatTitle'))}</h3><p class="muted">${esc(t('delChatWith'))} <strong>${esc(u.nickname || t('anon'))}</strong></p>
        <div class="profile-buttons col">
            <button class="moder-choice-btn all" data-act="delChatBoth" data-uid="${esc(uid)}">${esc(t('delBoth'))}</button>
            <button class="moder-choice-btn me" data-act="delChatMe" data-uid="${esc(uid)}">${esc(t('delMeOnly'))}</button>
            <button class="moder-choice-btn cancel" data-act="closeModal">${esc(t('cancel'))}</button>
        </div>`);
}
A.delChatMe = async el => {
    closeModal();
    try { await db.ref(`user_chats/${me.uid}/${el.dataset.uid}`).remove(); toast(t('chatHidden')); } catch (e) { toast(errText(e)); }
};
A.delChatBoth = async el => {
    const uid = el.dataset.uid;
    if (!confirm(t('delBothConfirm'))) return;
    closeModal();
    try {
        const rid = roomId(me.uid, uid);
        const snap = await db.ref('pm_messages/' + rid).once('value');
        const ups = {};
        snap.forEach(c => {
            const v = c.val(); if (!v) return;
            if (v.imageId && !v.sticker) ups['images/' + v.imageId] = null;
            if (v.videoId) ups['images/' + v.videoId] = null;
        });
        ups['pm_messages/' + rid] = null;
        ups[`user_chats/${me.uid}/${uid}`] = null;
        ups[`user_chats/${uid}/${me.uid}`] = null;
        await db.ref().update(ups);
        if (chat && chat.other === uid) backToChats();
        toast(t('chatDeleted'));
    } catch (e) { toast(errText(e)); }
};

/* перенос старых переписок в новый индекс (один раз) */
async function migrateChats() {
    const key = 'migrated_chats_v2_' + me.uid;
    if (store.get(key)) return;
    try {
        const us = (await db.ref('users').once('value')).val() || {};
        const hid = (await db.ref('hidden_chats/' + me.uid).once('value')).val() || {};
        const uids = Object.keys(us).filter(u => u !== me.uid).slice(0, 400);
        await Promise.all(uids.map(async u => {
            try {
                const rid = roomId(me.uid, u);
                if (hid[rid]) return;
                const s = await db.ref('pm_messages/' + rid).orderByChild('timestamp').limitToLast(100).once('value');
                if (!s.exists()) return;
                let last = null, unread = 0;
                s.forEach(c => {
                    const m = c.val();
                    if (!last || (m.timestamp || 0) >= (last.timestamp || 0)) last = m;
                    if ((m.userId || m.fromUserId) !== me.uid && m.status !== 'read') unread++;
                });
                await db.ref(`user_chats/${me.uid}/${u}`).update({
                    lastText: String(last.text || '').slice(0, 80), lastImage: !!(last.imageId || last.imageUrl),
                    lastTime: last.timestamp || 0, lastFrom: last.userId || last.fromUserId || '', unread
                });
            } catch (e) { /* пропускаем */ }
        }));
        store.set(key, '1');
    } catch (e) { console.warn('migrate', e); }
}

/* ---------- ОТКРЫТИЕ ЧАТОВ ---------- */
A.openGeneral = () => openChat('chat');
A.openPm = el => openChat('pm', el.dataset.uid);
function backToChats() { closeChat(); closeStickers(); showScreen('chats'); renderChats(); }
window.backToChats = backToChats;

async function openChat(kind, otherUid) {
    if (kind === 'pm' && (!otherUid || otherUid === me.uid)) return toast(t('cantSelf'));
    closeChat(); closeStickers(); closeModal('profileModal'); closeModal('listModal');
    const ctx = chat = {
        kind, other: otherUid || null, room: kind === 'chat' ? 'general' : roomId(me.uid, otherUid),
        msgs: {}, hidden: {}, loaded: false, offs: [], typers: [], typRaw: {}, otherData: null
    };
    showScreen('chat');
    $('chatHeader').classList.toggle('chat-header-pm', kind === 'pm');
    $('chatTitle').textContent = kind === 'chat' ? '💬 ' + t('general') : '…';
    $('status').textContent = '';
    const box = $('messages');
    box.innerHTML = '<div class="empty-note" id="loadNote">…</div>';
    box._stick = true;
    applyChatBg();
    ['messageInput', 'sendBtn', 'plusBtn', 'stickerBtn'].forEach(id => { $(id).disabled = false; });
    $('messageInput').value = '';

    if (kind === 'pm') {
        getUser(otherUid).then(u => { if (chat === ctx) $('chatTitle').textContent = u.nickname || t('peer'); });
        const uref = db.ref('users/' + otherUid);
        const ucb = s => { ctx.otherData = s.val(); updateHeaderStatus(); };
        uref.on('value', ucb); ctx.offs.push(() => uref.off('value', ucb));
    }
    const hidPath = kind === 'chat' ? `hidden_messages/${me.uid}` : `hidden_pm/${me.uid}/${ctx.room}`;
    try { ctx.hidden = (await db.ref(hidPath).once('value')).val() || {}; } catch (e) {}
    if (chat !== ctx) return;

    ctx.ref = db.ref(kind === 'chat' ? 'messages' : 'pm_messages/' + ctx.room);
    const q = ctx.ref.orderByChild('timestamp').limitToLast(80);
    const onAdd = s => {
        const m = norm(s.key, s.val());
        ctx.msgs[m.id] = m;
        if (ctx.hidden[m.id]) return;
        if (m.cid) document.querySelectorAll(`.message[data-cid="${m.cid}"]`).forEach(el => { if (el.dataset.id !== m.id) el.remove(); });
        addMessage(m);
        if (ctx.loaded && m.userId !== me.uid) markRead();
    };
    const onChange = s => {
        const m = norm(s.key, s.val());
        ctx.msgs[m.id] = m;
        const el = box.querySelector(`.message[data-id="${m.id}"]`);
        if (el && !el.querySelector('video')) el.replaceWith(buildMessage(m));   // не сбрасываем играющее видео
    };
    const onRemove = async s => {
        const still = await ctx.ref.child(s.key).once('value').catch(() => null);
        if (still && still.exists()) return;       // просто вышло за окно из 80 сообщений
        delete ctx.msgs[s.key];
        const el = box.querySelector(`.message[data-id="${s.key}"]`);
        if (el) { el.classList.add('removing'); setTimeout(() => el.remove(), 280); }
    };
    q.on('child_added', onAdd, e => { box.innerHTML = `<div class="empty-note">${esc(errText(e))}</div>`; });
    q.on('child_changed', onChange);
    q.on('child_removed', onRemove);
    ctx.offs.push(() => { q.off('child_added', onAdd); q.off('child_changed', onChange); q.off('child_removed', onRemove); });
    q.once('value', () => {
        if (chat !== ctx) return;
        ctx.loaded = true;
        $('loadNote')?.remove();
        if (!box.querySelector('.message')) box.innerHTML = `<div class="empty-note">${esc(kind === 'pm' ? t('firstMsg') : t('noMsgs'))}</div>`;
        scrollBottom(); markRead();
    }, () => {});

    const tref = db.ref('typing/' + ctx.room);
    const tcb = s => { ctx.typRaw = s.val() || {}; refreshTypers(ctx); };
    tref.on('value', tcb); ctx.offs.push(() => tref.off('value', tcb));
}
function closeChat() {
    stopTyping(); closeMsgMenu(); closePlus(); closeModal('vidModal');
    if (chat) chat.offs.forEach(f => { try { f(); } catch (e) {} });
    chat = null; clearReply(); renderTypingBar();
}

/* ---------- КТО ПЕЧАТАЕТ ---------- */
function refreshTypers(ctx) {
    if (chat !== ctx) return;
    const now = Date.now() + serverOffset;
    ctx.typers = Object.entries(ctx.typRaw || {})
        .filter(([u, x]) => u !== me.uid && now - (x.ts || 0) < 9000)
        .map(([u, x]) => ({ uid: u, nickname: x.nickname || '…' }));
    updateHeaderStatus();
}
setInterval(() => { if (chat) refreshTypers(chat); }, 3000);

function renderTypingBar(force) {
    const bar = $('typingBar'); if (!bar) return;
    const ty = chat ? chat.typers : [];
    if (!ty.length) { bar.style.display = 'none'; bar._key = ''; return; }
    const key = ty.map(x => x.uid).join(',') + '|' + lang;
    if (!force && bar._key === key && bar.style.display !== 'none') return;   // не перезапускаем анимацию
    bar._key = key; bar.style.display = 'flex';
    const shown = ty.slice(0, 3);
    const names = ty.slice(0, 2).map(x => x.nickname).join(', ') + (ty.length > 2 ? ' +' + (ty.length - 2) : '');
    bar.innerHTML = `<div class="typing-avs">${shown.map(x => `<div class="typing-av">${initial(x.nickname)}</div>`).join('')}</div>
        <div class="typing-bubble"><span></span><span></span><span></span></div>
        <div class="typing-name">${esc(names)} ${esc(t('typing'))}</div>`;
    const avs = bar.querySelectorAll('.typing-av');
    shown.forEach((x, i) => getAvatar(x.uid).then(a => { if (a && avs[i] && avs[i].isConnected) avs[i].innerHTML = avatarInner(a, x.nickname); }));
    const b = $('messages');
    if (b && b._stick) requestAnimationFrame(scrollBottom);
}
function updateHeaderStatus(force) {
    if (!chat) return;
    const el = $('status');
    if (chat.typers.length) el.textContent = (chat.kind === 'chat' ? chat.typers.slice(0, 2).map(x => x.nickname).join(', ') + ' ' : '') + t('typing');
    else if (chat.kind === 'pm') el.textContent = fmtStatus(chat.otherData)[0];
    else el.textContent = '';
    renderTypingBar(force);
}
A.headerProfile = () => { if (chat && chat.kind === 'pm') showUserProfile(chat.other); };

function norm(id, r) {
    return {
        id, userId: r.userId || r.fromUserId || '', nickname: r.nickname || r.fromNickname || t('anon'),
        text: r.text || '', imageId: r.imageId || null, imageUrl: r.imageUrl || null,
        videoId: r.videoId || null, thumb: r.thumb || null, dur: r.dur || 0,
        sticker: !!r.sticker, packId: r.packId || null,
        timestamp: r.timestamp || 0, status: r.status || 'sent', edited: !!r.edited,
        replyTo: r.replyTo || null, cid: r.cid || null
    };
}

/* ---------- ОТРИСОВКА СООБЩЕНИЙ ---------- */
const statusIcon = s => s === 'sending' ? '…' : s === 'read' ? '✓✓' : s === 'failed' ? '❌' : '✓';
function buildMessage(m) {
    const mine = m.userId === me.uid;
    const el = document.createElement('div');
    el.className = 'message ' + (mine ? 'my-message' : 'other-message');
    el.dataset.id = m.id; el.dataset.uid = m.userId || '';
    if (m.cid) el.dataset.cid = m.cid;
    const hasImg = !!(m.imageId || m.imageUrl || m.localImage);
    const hasVid = !!m.videoId;
    const reply = m.replyTo
        ? `<div class="reply-preview" data-act="goto" data-id="${esc(m.replyTo.id)}"><strong>${esc(m.replyTo.nickname)}:</strong> ${esc(m.replyTo.text || '')}</div>` : '';
    let body;
    const txt = m.text ? `<div class="msg-text">${esc(m.text)}</div>` : '';
    if (m.sticker) body = '<img class="sticker-img" data-act="stickerTap" alt="">';
    else if (hasVid) body = `<div class="video-wrap" data-act="playVideo"><img class="video-thumb" src="${esc(m.thumb || '')}" alt=""><span class="play-ic">▶</span><span class="vid-dur">${fmtDur(m.dur)}</span></div>` + txt;
    else body = (hasImg ? '<img class="message-image" data-act="viewImg" alt="">' : '') + txt;
    const bcls = m.sticker ? ' sticker-bubble' : (hasImg || hasVid) ? ' has-image' : '';
    el.innerHTML =
        `<div class="message-avatar" data-act="openUserProfile" data-uid="${esc(m.userId)}">${initial(m.nickname)}</div>` +
        `<div class="message-content">${reply}
            <div class="message-bubble${bcls}">${body}</div>
            <div class="message-info">
                <span class="message-nickname" data-act="openUserProfile" data-uid="${esc(m.userId)}">${mine ? esc(t('you')) : esc(m.nickname)}</span>
                <span class="message-time">${m.timestamp ? hhmm(m.timestamp) : ''}</span>
                ${m.edited ? `<span class="edited-badge">${esc(t('edited'))}</span>` : ''}
                ${mine ? `<span class="bubble-status ${m.status}">${statusIcon(m.status)}</span>` : ''}
            </div></div>`;
    const img = el.querySelector('img.message-image, img.sticker-img');
    if (img) {
        const fail = () => {
            const d = document.createElement('div'); d.className = 'img-missing'; d.textContent = t('photoMissing');
            if (img.parentNode) img.replaceWith(d);
        };
        img.onerror = fail;
        img.onload = () => { const b = $('messages'); if (b && b._stick) scrollBottom(); };
        if (m.localImage) img.src = m.localImage;
        else if (m.imageId) fillImg(img, m.imageId, fail);
        else img.src = m.imageUrl;
    }
    const th = el.querySelector('img.video-thumb');
    if (th) th.onload = () => { const b = $('messages'); if (b && b._stick) scrollBottom(); };
    getAvatar(m.userId).then(a => {
        const av = el.querySelector('.message-avatar'); if (a && av) av.innerHTML = avatarInner(a, m.nickname);
    });
    attachSwipe(el, m.id);
    return el;
}
function addMessage(m) {
    const box = $('messages');
    if (box.querySelector(`.message[data-id="${m.id}"]`)) return;
    box.querySelector('.empty-note')?.remove();
    box.appendChild(buildMessage(m));
    if (m.userId === me.uid || box._stick || !(chat && chat.loaded)) scrollBottom();
}
function scrollBottom() { const b = $('messages'); b.scrollTop = b.scrollHeight; }
$('messages').addEventListener('scroll', e => {
    const b = e.currentTarget; b._stick = b.scrollHeight - b.scrollTop - b.clientHeight < 120;
}, { passive: true });

function attachSwipe(el, id) {
    let sx = 0, sy = 0, dx = 0, lock = false, on = false;
    el.addEventListener('touchstart', e => { const p = e.touches[0]; sx = p.clientX; sy = p.clientY; dx = 0; lock = false; on = true; el.style.transition = 'none'; }, { passive: true });
    el.addEventListener('touchmove', e => {
        if (!on || lock) return;
        const p = e.touches[0], x = p.clientX - sx, y = p.clientY - sy;
        if (Math.abs(y) > Math.abs(x) && Math.abs(y) > 10) { lock = true; el.style.transform = ''; el.classList.remove('swipe-reply'); return; }
        if (x < -5) { dx = Math.max(x, -80); el.style.transform = `translateX(${dx}px)`; el.classList.toggle('swipe-reply', dx < -40); }
    }, { passive: true });
    const end = () => {
        if (!on) return; on = false;
        const fire = dx < -40;
        el.style.transition = ''; el.style.transform = ''; el.classList.remove('swipe-reply'); dx = 0;
        if (fire) { setReply(id); if (navigator.vibrate) navigator.vibrate(30); }
    };
    el.addEventListener('touchend', end); el.addEventListener('touchcancel', end);
}
A.goto = el => {
    const m = $('messages').querySelector(`.message[data-id="${el.dataset.id}"]`);
    if (!m) return toast(t('notFound'));
    m.scrollIntoView({ behavior: 'smooth', block: 'center' });
    m.classList.add('highlight'); setTimeout(() => m.classList.remove('highlight'), 1800);
};
A.openUserProfile = el => showUserProfile(el.dataset.uid);
A.stickerTap = el => {
    const m = chat && chat.msgs[el.closest('.message').dataset.id];
    if (m && m.packId) openPack(m.packId);
};
A.playVideo = async el => {
    const msg = el.closest('.message');
    const m = chat && msg && chat.msgs[msg.dataset.id];
    if (!m || !m.videoId || el.classList.contains('loading')) return;
    el.classList.add('loading');
    try {
        const url = await getVideoUrl(m.videoId);
        const v = document.createElement('video');
        v.className = 'message-video'; v.src = url; v.controls = true; v.autoplay = true; v.playsInline = true;
        if (m.thumb) v.poster = m.thumb;
        el.replaceWith(v);
        v.play().catch(() => {});
    } catch (e) { el.classList.remove('loading'); toast(t('videoLoadFail')); }
};

/* ---------- ОТВЕТ ---------- */
function setReply(id) {
    if (!chat) return;
    const m = chat.msgs[id]; if (!m) return;
    const text = m.sticker ? '🖼 ' + t('sticker')
        : m.videoId ? '🎥 ' + (m.text || t('videoWord'))
        : (m.imageId || m.imageUrl ? '📷 ' : '') + (m.text || (m.imageId || m.imageUrl ? t('photoWord') : ''));
    replyTo = { id, nickname: m.nickname, text: text.slice(0, 100) };
    $('replyPanel').style.display = 'block';
    $('replyPanelName').textContent = m.nickname;
    $('replyPanelMessage').textContent = replyTo.text;
    $('messageInput').focus();
}
function clearReply() { replyTo = null; const p = $('replyPanel'); if (p) p.style.display = 'none'; }
A.clearReply = clearReply;

/* ---------- МЕНЮ СООБЩЕНИЯ (долгое нажатие) ---------- */
longPress($('messages'), '.message-bubble', b => openMsgMenu(b));
async function openMsgMenu(bubble) {
    const el = bubble.closest('.message'); if (!el || !chat) return;
    const m = chat.msgs[el.dataset.id]; if (!m) return;
    if (m.sticker) { try { await loadStk(); } catch (e) {} }
    closeMsgMenu();
    const mine = m.userId === me.uid, hasImg = !!(m.imageId || m.imageUrl), hasVid = !!m.videoId, items = [];
    const add = (act, icon, label, cls = '') => items.push(`<button class="mm-item ${cls}" data-act="${act}" data-id="${esc(m.id)}"><span class="mm-ic">${icon}</span>${esc(label)}</button>`);
    add('doReply', '↩', t('reply'));
    if (m.sticker) {
        add('doFav', '★', stk.data.fav[m.imageId] ? t('favRemove') : t('favAdd'));
        if (m.packId) add('doOpenPack', '▦', t('openPack'));
    } else {
        if (m.text) add('doCopy', '❐', t('copy'));
        if (hasImg || hasVid) add('doDownload', '⤓', t('download'));
        if (mine && m.text && !hasImg && !hasVid) add('doEdit', '✎', t('edit'));
    }
    add('delMe', '', t('hideMe'));
    if (mine || isAdmin) add('delAll', '✕', t('delAll'), 'danger');
    const layer = document.createElement('div');
    layer.id = 'msgMenuLayer'; layer.className = 'mm-layer';
    layer.innerHTML = `<div class="msg-menu" id="msgMenu">${items.join('')}</div>`;
    layer.addEventListener('click', e => { if (e.target === layer) closeMsgMenu(); });
    document.body.appendChild(layer);
    el.classList.add('mm-active');
    const menu = layer.firstChild, r = bubble.getBoundingClientRect();
    const mw = menu.offsetWidth, mh = menu.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    let left = mine ? r.right - mw : r.left;
    left = Math.max(8, Math.min(vw - mw - 8, left));
    let top = r.bottom + 8;
    if (top + mh > vh - 8) { top = r.top - mh - 8; if (top < 8) top = Math.max(8, vh - mh - 16); }
    menu.style.left = left + 'px'; menu.style.top = top + 'px';
}
function closeMsgMenu() {
    $('msgMenuLayer')?.remove();
    document.querySelectorAll('.message.mm-active').forEach(e => e.classList.remove('mm-active'));
}
const msgOf = el => chat && chat.msgs[el.dataset.id];
A.doReply = el => { closeMsgMenu(); setReply(el.dataset.id); };
A.doCopy = el => {
    const m = msgOf(el); closeMsgMenu();
    if (!m) return;
    const done = () => toast(t('copied'));
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(m.text).then(done, () => legacyCopy(m.text, done));
    else legacyCopy(m.text, done);
};
function legacyCopy(text, done) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    ta.remove();
}
A.doDownload = async el => {
    const m = msgOf(el); closeMsgMenu();
    if (!m) return;
    try {
        const a = document.createElement('a');
        if (m.videoId) {
            a.href = await getVideoUrl(m.videoId); a.download = 'video_' + (m.timestamp || Date.now()) + '.mp4';
        } else {
            a.href = m.imageId ? await getImage(m.imageId) : m.imageUrl; a.download = 'photo_' + (m.timestamp || Date.now()) + '.jpg';
        }
        a.rel = 'noopener';
        document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { toast(t('photoMissing')); }
};
A.doEdit = el => {
    const m = msgOf(el); closeMsgMenu(); if (!m) return;
    const md = showModal(`<h3>✎ ${esc(t('edit'))}</h3><textarea id="editInput" maxlength="1000" rows="4"></textarea>
        <div class="profile-buttons"><button data-act="saveEdit" data-id="${esc(m.id)}">${esc(t('save'))}</button>
        <button data-act="closeModal">${esc(t('cancel'))}</button></div>`);
    const i = md.querySelector('#editInput'); i.value = m.text; i.focus();
};
A.saveEdit = async el => {
    const v = $('editInput').value.trim(); if (!v || !chat) return toast(t('empty'));
    try { await chat.ref.child(el.dataset.id).update({ text: v, edited: true }); closeModal(); } catch (e) { toast(errText(e)); }
};
A.delMe = el => {
    closeMsgMenu(); if (!chat) return;
    const id = el.dataset.id, path = chat.kind === 'chat' ? `hidden_messages/${me.uid}/${id}` : `hidden_pm/${me.uid}/${chat.room}/${id}`;
    db.ref(path).set(true).then(() => {
        chat.hidden[id] = true;
        $('messages').querySelector(`.message[data-id="${id}"]`)?.remove();
        toast(t('hiddenToast'));
    }).catch(e => toast(errText(e)));
};
A.delAll = async el => {
    closeMsgMenu();
    if (!chat || !confirm(t('delConfirm'))) return;
    const id = el.dataset.id, m = chat.msgs[id];
    try {
        await chat.ref.child(id).remove();
        if (m && m.imageId && !m.sticker) db.ref('images/' + m.imageId).remove().catch(() => {});
        if (m && m.videoId) db.ref('images/' + m.videoId).remove().catch(() => {});
        toast(t('deletedAll'));
    } catch (e) { toast(errText(e)); }
};
A.doFav = async el => {
    const m = msgOf(el); closeMsgMenu();
    if (m) { try { await toggleFav(m.imageId, m.packId); } catch (e) { toast(errText(e)); } }
};
A.doOpenPack = el => { const m = msgOf(el); closeMsgMenu(); if (m && m.packId) openPack(m.packId); };

/* ---------- ОТПРАВКА ---------- */
function baseMsg(ctx, extra) {
    const m = { userId: me.uid, nickname: myNick, timestamp: Date.now(), status: 'sent', ...extra };
    if (ctx.kind === 'pm') m.toUserId = ctx.other;
    if (replyTo) m.replyTo = replyTo;
    return m;
}
async function pushMsg(ctx, m) {
    await ctx.ref.push().set(m);
    db.ref(`users/${me.uid}/messageCount`).transaction(c => (c || 0) + 1);
    if (ctx.kind === 'pm') {
        const base = {
            lastText: String(m.text || '').slice(0, 80), lastImage: !!m.imageId && !m.sticker,
            lastVideo: !!m.videoId, lastSticker: !!m.sticker, lastTime: m.timestamp, lastFrom: me.uid
        };
        db.ref(`user_chats/${me.uid}/${ctx.other}`).update({ ...base, unread: 0 });
        const r = db.ref(`user_chats/${ctx.other}/${me.uid}`);
        r.update(base).then(() => r.child('unread').transaction(c => (c || 0) + 1)).catch(() => {});
    }
}
async function sendText() {
    const i = $('messageInput'), text = i.value.trim();
    if (!text || !chat || !me) return;
    const ctx = chat, m = baseMsg(ctx, { text });
    i.value = ''; clearReply(); stopTyping();
    try { await pushMsg(ctx, m); } catch (e) { toast(t('notSent') + errText(e)); i.value = text; }
}
A.send = sendText;
$('messageInput').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); } });

/* печатает */
$('messageInput').addEventListener('input', e => {
    if (!chat || !me) return;
    if (e.target.value.trim()) {
        if (amTyping !== chat.room) {
            stopTyping(); amTyping = chat.room; lastPing = Date.now();
            const r = db.ref(`typing/${amTyping}/${me.uid}`);
            r.set({ nickname: myNick, ts: TS }); r.onDisconnect().remove();
        } else if (Date.now() - lastPing > 4000) {
            lastPing = Date.now();
            db.ref(`typing/${amTyping}/${me.uid}`).update({ ts: TS }).catch(() => {});
        }
        clearTimeout(typingTimer); typingTimer = setTimeout(stopTyping, 3000);
    } else stopTyping();
});
$('messageInput').addEventListener('blur', () => stopTyping());
function stopTyping() {
    clearTimeout(typingTimer);
    if (!amTyping || !me) return;
    db.ref(`typing/${amTyping}/${me.uid}`).remove().catch(() => {});
    amTyping = null;
}
window.addEventListener('beforeunload', () => {
    if (me && startedUid) {
        db.ref('users/' + me.uid).update({ online: false, lastSeen: Date.now() });
        if (amTyping) db.ref(`typing/${amTyping}/${me.uid}`).remove();
    }
});

/* ---------- ПРОЧИТАНО ---------- */
function markRead() {
    if (!chat || !chat.loaded || document.visibilityState !== 'visible') return;
    const up = {};
    Object.values(chat.msgs).forEach(m => { if (m.userId !== me.uid && m.status !== 'read') up[m.id + '/status'] = 'read'; });
    if (Object.keys(up).length) chat.ref.update(up).catch(() => {});
    if (chat.kind === 'pm' && myChats[chat.other] && myChats[chat.other].unread > 0)
        db.ref(`user_chats/${me.uid}/${chat.other}/unread`).set(0).catch(() => {});
}

/* ---------- ФОН ЧАТА ---------- */
function applyChatBg() {
    const bg = store.get('chatBg', '');
    $('messagesWrap').classList.toggle('has-bg', !!bg);
    $('chatBg').style.backgroundImage = bg ? `url("${bg}")` : '';
}
A.bgPick = async () => {
    const f = await pickImage(); if (!f) return;
    try {
        const src = await readFile(f);
        let url = await shrink(src, 1600, 0.8);
        if (!store.set('chatBg', url)) {
            url = await shrink(src, 1000, 0.65);
            if (!store.set('chatBg', url)) return toast(t('noSpace'));
        }
        applyChatBg(); toast(t('bgSet'));
        if (SET.open && SET.sec === 'custom') showSection('custom');
    } catch (e) { toast(t('errPrefix') + e.message); }
};
A.bgClear = () => {
    store.del('chatBg'); applyChatBg(); toast(t('bgCleared'));
    if (SET.open && SET.sec === 'custom') showSection('custom');
};

/* ---------- КНОПКА «+» ---------- */
function closePlus() { $('plusMenu')?.remove(); }
A.plusMenu = () => {
    if ($('plusMenu')) return closePlus();
    if (!chat) return;
    const m = document.createElement('div');
    m.id = 'plusMenu'; m.className = 'plus-menu';
    m.innerHTML = `<button class="mm-item" data-act="plusPhoto"><span class="mm-ic">${ICON.image}</span>${esc(t('plusPhoto'))}</button>
        <button class="mm-item" data-act="plusVideo"><span class="mm-ic">${ICON.video}</span>${esc(t('plusVideo'))}</button>
        <button class="mm-item" data-act="newSticker"><span class="mm-ic">${ICON.smile}</span>${esc(t('plusSticker'))}</button>`;
    $('chatContainer').appendChild(m);
};
A.plusPhoto = async () => {
    closePlus(); if (!chat) return;
    const f = await pickImage(); if (!f) return;
    try { openPhotoEditor(await readFile(f), 'photo'); } catch (e) { toast(e.message); }
};
A.newSticker = async () => {
    closePlus();
    const f = await pickImage(); if (!f) return;
    try { await loadStk(); openPhotoEditor(await readFile(f), 'sticker'); } catch (e) { toast(errText(e)); }
};

/* ---------- ВИДЕО ---------- */
A.plusVideo = async () => {
    closePlus(); if (!chat) return;
    const f = await pickVideo(); if (!f) return;
    const url = URL.createObjectURL(f);
    pendingVid = { file: f, url };
    const md = showModal(`<h3>🎥 ${esc(t('videoWord'))}</h3>
        <video class="vid-preview" src="${url}" controls playsinline></video>
        <input type="text" id="vidCaption" placeholder="${esc(t('captionPh'))}" maxlength="200">
        <div class="profile-buttons">
            <button id="vidSendBtn" data-act="vidSend">${esc(t('send'))}</button>
            <button class="moder-choice-btn cancel" data-act="closeModal" data-modal="vidModal">${esc(t('cancel'))}</button>
        </div>`, 'vidModal');
    md._onClose = () => { try { URL.revokeObjectURL(url); } catch (e) {} };
};
A.vidSend = async () => {
    const ctx = chat; if (!ctx || !pendingVid) return;
    const { file, url } = pendingVid;
    const btn = $('vidSendBtn'); if (btn) btn.disabled = true;
    const caption = ($('vidCaption') || {}).value ? $('vidCaption').value.trim() : '';
    let meta;
    try { meta = await videoMeta(url); } catch (e) { if (btn) btn.disabled = false; return toast(t('videoFail')); }
    pendingVid = null; closeModal('vidModal');
    const cid = 'c' + Date.now() + Math.random().toString(36).slice(2, 6);
    const reply = replyTo;
    addMessage({ id: 'temp_' + cid, cid, userId: me.uid, nickname: myNick, text: caption, videoId: 'pending', thumb: meta.thumb, dur: meta.dur, timestamp: Date.now(), status: 'sending', replyTo: reply });
    clearReply();
    const vref = db.ref('images').push();
    try {
        let data = await readFile(file);
        if (/^data:;/.test(data)) data = data.replace(/^data:;/, 'data:video/mp4;');
        if (data.length > 9.5e6) throw new Error(t('videoTooBig'));
        await vref.set(data);
        const m = { userId: me.uid, nickname: myNick, timestamp: Date.now(), status: 'sent', text: caption, videoId: vref.key, thumb: meta.thumb, dur: meta.dur, cid };
        if (ctx.kind === 'pm') m.toUserId = ctx.other;
        if (reply) m.replyTo = reply;
        await pushMsg(ctx, m);
    } catch (e) {
        vref.remove().catch(() => {});
        const st = document.querySelector(`.message[data-id="temp_${cid}"] .bubble-status`);
        if (st) { st.className = 'bubble-status failed'; st.textContent = '❌'; }
        setTimeout(() => document.querySelector(`.message[data-id="temp_${cid}"]`)?.remove(), 5000);
        toast(t('videoNotSent') + errText(e));
    }
};

/* ---------- РЕДАКТОР ФОТО / СТИКЕРА / АВАТАРА ---------- */
const ed = { orig: null, rot: null, deg: 0, mode: 'photo', kind: 'single', W: 1, H: 1, crop: { x: 0, y: 0, w: 1, h: 1 } };
async function openPhotoEditor(src, mode = 'photo') {
    if ($('photoEditor')) return;
    ed.mode = mode; ed.kind = 'single';
    const isSt = mode === 'sticker', isAv = mode === 'avatar';
    try { ed.orig = await shrink(src, isSt ? 1024 : 1600, 0.9, false, isSt ? 'image/png' : 'image/jpeg'); } catch (e) { return toast(t('needImage')); }
    ed.rot = ed.orig; ed.deg = 0; ed.crop = { x: 0, y: 0, w: 1, h: 1 };
    const myPacks = Object.values(stk.data.packs).filter(p => p.owner === me.uid);
    let bottom;
    if (isSt) bottom = `
        <div class="photo-editor-bottom col">
            <div class="seg">
                <button data-act="edKind" data-kind="single" class="active">${esc(t('justSticker'))}</button>
                <button data-act="edKind" data-kind="pack">${esc(t('makePack'))}</button>
            </div>
            <div id="packBox" style="display:none;width:100%">
                <select id="packSel">${myPacks.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}<option value="new">${esc(t('newPack'))}</option></select>
                <input type="text" id="packName" class="photo-editor-caption" placeholder="${esc(t('packName'))}" maxlength="30">
            </div>
            <button class="photo-editor-send" data-act="edSaveSticker" style="width:100%">${esc(t('save'))}</button>
        </div>`;
    else if (isAv) bottom = `
        <div class="photo-editor-bottom col">
            <button class="photo-editor-send" data-act="edSaveAvatar" style="width:100%">${esc(t('save'))}</button>
        </div>`;
    else bottom = `
        <div class="photo-editor-bottom">
            <input type="text" class="photo-editor-caption" id="edCaption" placeholder="${esc(t('captionPh'))}" maxlength="200">
            <button class="photo-editor-send" data-act="edSend">${esc(t('send'))}</button>
        </div>`;
    const el = document.createElement('div');
    el.className = 'photo-editor'; el.id = 'photoEditor';
    el.innerHTML = `
        <div class="photo-editor-top"><button data-act="closeEd">✕ ${esc(t('cancelEd'))}</button><div class="photo-editor-title">${esc(isSt ? t('stickerEd') : isAv ? t('avatarEd') : t('photoWord'))}</div><div style="width:80px"></div></div>
        <div class="photo-editor-area"><div class="photo-editor-canvas-wrap${isSt ? ' checker' : ''}${isAv ? ' avatar-mode' : ''}" id="edWrap">
            <img id="edImg" draggable="false" alt="">
            <div class="crop-overlay"><div class="crop-box" id="cropBox">
                <div class="crop-move" id="cropMove"></div>
                <div class="crop-handle tl" data-corner="tl"></div><div class="crop-handle tr" data-corner="tr"></div>
                <div class="crop-handle bl" data-corner="bl"></div><div class="crop-handle br" data-corner="br"></div>
            </div></div></div></div>
        <div class="photo-editor-controls">
            <button data-act="edRotate"><span class="icon">↺</span><span class="label">${esc(t('rotate'))}</span></button>
            <button data-act="edReset"><span class="icon">↻</span><span class="label">${esc(t('back'))}</span></button>
            ${mode === 'photo' ? `<button data-act="edRewrite"><span class="icon">✎</span><span class="label">${esc(t('rewrite'))}</span></button>` : ''}
        </div>${bottom}`;
    document.body.appendChild(el);
    if (isSt) $('packName').style.display = 'none';
    if (isSt && !myPacks.length) $('packSel').value = 'new';
    await setEdImg(ed.rot);
    setupCropHandles();
}
function initCrop() {
    if (ed.mode === 'avatar') {
        // самый большой квадрат по центру
        if (ed.W >= ed.H) { const w = ed.H / ed.W; ed.crop = { x: (1 - w) / 2, y: 0, w, h: 1 }; }
        else { const h = ed.W / ed.H; ed.crop = { x: 0, y: (1 - h) / 2, w: 1, h }; }
    } else ed.crop = { x: 0, y: 0, w: 1, h: 1 };
    updateCrop();
}
function setEdImg(src) {
    return new Promise(res => {
        const i = $('edImg'); if (!i) return res();
        i.onload = () => { ed.W = i.naturalWidth || 1; ed.H = i.naturalHeight || 1; initCrop(); res(); };
        i.src = src;
    });
}
function updateCrop() {
    const b = $('cropBox'); if (!b) return;
    const { x, y, w, h } = ed.crop;
    b.style.left = x * 100 + '%'; b.style.top = y * 100 + '%'; b.style.width = w * 100 + '%'; b.style.height = h * 100 + '%';
}
function setupCropHandles() {
    const wrap = $('edWrap'); if (!wrap) return;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const listen = (move) => {
        const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up); };
        document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
    };
    // двигать рамку
    const mv = $('cropMove');
    if (mv) mv.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        const sx = e.clientX, sy = e.clientY, sc = { ...ed.crop }, r = wrap.getBoundingClientRect();
        listen(ev => {
            const x = clamp(sc.x + (ev.clientX - sx) / r.width, 0, 1 - sc.w);
            const y = clamp(sc.y + (ev.clientY - sy) / r.height, 0, 1 - sc.h);
            ed.crop = { x, y, w: sc.w, h: sc.h }; updateCrop();
        });
    });
    // тянуть за уголки
    document.querySelectorAll('.crop-handle').forEach(h => {
        h.addEventListener('pointerdown', e => {
            e.preventDefault(); e.stopPropagation();
            const c = h.dataset.corner, sx = e.clientX, sy = e.clientY, sc = { ...ed.crop }, r = wrap.getBoundingClientRect(), mn = 0.15;
            if (ed.mode === 'avatar') {
                const asp = ed.W / ed.H;                       // h = w * asp  (квадрат в пикселях)
                const ax = c.includes('l') ? sc.x + sc.w : sc.x;  // противоположный угол — якорь
                const ay = c.includes('t') ? sc.y + sc.h : sc.y;
                listen(ev => {
                    const dx = (ev.clientX - sx) / r.width;
                    const w0 = c.includes('r') ? sc.w + dx : sc.w - dx;
                    const maxW = Math.min(c.includes('l') ? ax : 1 - ax, (c.includes('t') ? ay : 1 - ay) / asp);
                    const w = clamp(w0, mn, Math.max(mn, maxW)), hh = w * asp;
                    ed.crop = { x: c.includes('l') ? ax - w : ax, y: c.includes('t') ? ay - hh : ay, w, h: hh }; updateCrop();
                });
                return;
            }
            listen(ev => {
                const dx = (ev.clientX - sx) / r.width, dy = (ev.clientY - sy) / r.height;
                let l = sc.x, tp = sc.y, rt = sc.x + sc.w, bt = sc.y + sc.h;
                if (c.includes('l')) l = clamp(sc.x + dx, 0, rt - mn);
                if (c.includes('r')) rt = clamp(rt + dx, l + mn, 1);
                if (c.includes('t')) tp = clamp(sc.y + dy, 0, bt - mn);
                if (c.includes('b')) bt = clamp(bt + dy, tp + mn, 1);
                ed.crop = { x: l, y: tp, w: rt - l, h: bt - tp }; updateCrop();
            });
        });
    });
}
async function rotateSrc(src, deg) {
    const im = await loadImage(src), c = document.createElement('canvas');
    if (deg === 90 || deg === 270) { c.width = im.height; c.height = im.width; } else { c.width = im.width; c.height = im.height; }
    const x = c.getContext('2d');
    x.translate(c.width / 2, c.height / 2); x.rotate(deg * Math.PI / 180); x.drawImage(im, -im.width / 2, -im.height / 2);
    return ed.mode === 'sticker' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.9);
}
A.edRotate = async () => { ed.deg = (ed.deg + 90) % 360; ed.rot = await rotateSrc(ed.orig, ed.deg); await setEdImg(ed.rot); };
A.edReset = async () => { ed.deg = 0; ed.rot = ed.orig; await setEdImg(ed.rot); };
A.edRewrite = () => { const i = $('edCaption'); if (i) { i.value = ''; i.focus(); } };
A.edKind = el => {
    ed.kind = el.dataset.kind;
    document.querySelectorAll('.seg [data-kind]').forEach(b => b.classList.toggle('active', b === el));
    $('packBox').style.display = ed.kind === 'pack' ? '' : 'none';
    if (ed.kind === 'pack') $('packName').style.display = $('packSel').value === 'new' ? '' : 'none';
};
function closePhotoEditor() { $('photoEditor')?.remove(); }
A.closeEd = closePhotoEditor;
async function renderEdited(max, mime, q) {
    const im = await loadImage(ed.rot), { x, y, w, h } = ed.crop;
    const sw = Math.round(w * im.width), sh = Math.round(h * im.height);
    const k = Math.min(1, max / Math.max(sw, sh));
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(sw * k)); c.height = Math.max(1, Math.round(sh * k));
    const ctx2 = c.getContext('2d');
    if (mime === 'image/jpeg') { ctx2.fillStyle = '#fff'; ctx2.fillRect(0, 0, c.width, c.height); }
    ctx2.drawImage(im, Math.round(x * im.width), Math.round(y * im.height), sw, sh, 0, 0, c.width, c.height);
    return c.toDataURL(mime, q);
}
A.edSend = async () => {
    const ctx = chat; if (!ctx) return;
    const caption = $('edCaption').value.trim();
    let b64;
    try {
        b64 = await renderEdited(960, 'image/jpeg', 0.75);
        if (b64.length > 550000) b64 = await shrink(b64, 720, 0.6);
    } catch (e) { return toast(t('errPrefix') + e.message); }
    const cid = 'c' + Date.now() + Math.random().toString(36).slice(2, 6);
    const reply = replyTo;
    addMessage({ id: 'temp_' + cid, cid, userId: me.uid, nickname: myNick, text: caption, localImage: b64, timestamp: Date.now(), status: 'sending', replyTo: reply });
    closePhotoEditor(); clearReply();
    const imgRef = db.ref('images').push();
    try {
        await imgRef.set(b64);
        imageCache[imgRef.key] = Promise.resolve(b64);
        const m = { userId: me.uid, nickname: myNick, timestamp: Date.now(), status: 'sent', text: caption, imageId: imgRef.key, cid };
        if (ctx.kind === 'pm') m.toUserId = ctx.other;
        if (reply) m.replyTo = reply;
        await pushMsg(ctx, m);
    } catch (e) {
        imgRef.remove().catch(() => {});
        const st = document.querySelector(`.message[data-id="temp_${cid}"] .bubble-status`);
        if (st) { st.className = 'bubble-status failed'; st.textContent = '❌'; }
        setTimeout(() => document.querySelector(`.message[data-id="temp_${cid}"]`)?.remove(), 5000);
        toast(t('photoNotSent') + errText(e));
    }
};
/* сохранение аватарки из редактора */
A.edSaveAvatar = async () => {
    const btn = document.querySelector('[data-act="edSaveAvatar"]'); if (btn) btn.disabled = true;
    try {
        const url = await renderEdited(256, 'image/jpeg', 0.85);
        await db.ref('avatars/' + me.uid).set(url);
        avatarCache[me.uid] = { t: Date.now(), p: Promise.resolve(url) }; delete userCache[me.uid];
        const p = $('myAv'); if (p) p.innerHTML = avatarInner(url, myNick);
        document.querySelectorAll('.message.my-message .message-avatar').forEach(a => { a.innerHTML = avatarInner(url, myNick); });
        closePhotoEditor(); toast(t('photoUpdated'));
    } catch (e) { toast(t('errPrefix') + errText(e)); if (btn) btn.disabled = false; }
};

/* ---------- СТИКЕРЫ ---------- */
async function loadStk(force) {
    if (stk.loaded && !force) return;
    const [f, o, p] = await Promise.all([
        db.ref(`user_stickers/${me.uid}/fav`).once('value'),
        db.ref(`user_stickers/${me.uid}/own`).once('value'),
        db.ref(`user_packs/${me.uid}`).once('value')
    ]);
    stk.data.fav = f.val() || {}; stk.data.own = o.val() || {};
    const packs = {};
    await Promise.all(Object.keys(p.val() || {}).map(async id => {
        const s = await db.ref('sticker_packs/' + id).once('value');
        if (s.exists()) packs[id] = { id, ...s.val() };
    }));
    stk.data.packs = packs; stk.loaded = true;
}
const recentKey = () => 'recentStk_' + (me ? me.uid : '');
const getRecent = () => { try { return JSON.parse(store.get(recentKey(), '[]')) || []; } catch (e) { return []; } };
function pushRecent(s) {
    const list = getRecent().filter(x => x.imageId !== s.imageId);
    list.unshift({ imageId: s.imageId, packId: s.packId || null });
    store.set(recentKey(), JSON.stringify(list.slice(0, 30)));
}
async function toggleFav(imageId, packId) {
    await loadStk();
    const ref = db.ref(`user_stickers/${me.uid}/fav/${imageId}`);
    if (stk.data.fav[imageId]) { await ref.remove(); delete stk.data.fav[imageId]; toast(t('favRemoved')); }
    else {
        if (Object.keys(stk.data.fav).length >= 15) return toast(t('favLimit'));
        const v = { imageId, ts: Date.now() }; if (packId) v.packId = packId;
        await ref.set(v); stk.data.fav[imageId] = v; toast(t('favAdded'));
    }
    if (stk.open) renderStk();
}
function closeStickers() { stk.open = false; const p = $('stickerPanel'); if (p) p.style.display = 'none'; }
A.toggleStickers = async () => {
    if (!chat) return;
    if (stk.open) return closeStickers();
    stk.open = true; $('stickerPanel').style.display = 'flex';
    $('stkGrid').innerHTML = '<div class="empty-note">…</div>';
    try { await loadStk(); } catch (e) { toast(errText(e)); }
    renderStk();
};
function stkItems() {
    const tab = stk.tab;
    if (tab === 'recent') return getRecent().map(x => ({ ...x, kind: 'recent' }));
    if (tab === 'fav') return Object.values(stk.data.fav).sort((a, b) => (b.ts || 0) - (a.ts || 0)).map(x => ({ imageId: x.imageId, packId: x.packId || null, kind: 'fav' }));
    if (tab === 'own') return Object.keys(stk.data.own).map(id => ({ imageId: id, packId: null, kind: 'own', del: true }));
    const p = stk.data.packs[tab];
    if (!p) return [];
    return Object.keys(p.stickers || {}).map(id => ({ imageId: id, packId: p.id, kind: 'pack', del: p.owner === me.uid }));
}
function renderStk() {
    if (!stk.open) return;
    if (stk.tab.length > 6 && !stk.data.packs[stk.tab] && !['recent', 'fav', 'own'].includes(stk.tab)) stk.tab = 'recent';
    const favN = Object.keys(stk.data.fav).length;
    const tabs = [['recent', '⏱'], ['fav', `★ ${favN}/15`], ['own', '☺']]
        .concat(Object.values(stk.data.packs).map(p => [p.id, p.name]));
    $('stkTabs').innerHTML = tabs.map(([id, label]) => `<button class="stk-tab${stk.tab === id ? ' active' : ''}" data-act="stkTab" data-tab="${esc(id)}">${esc(label)}</button>`).join('')
        + '<button class="stk-tab" data-act="newSticker">＋</button>';
    const p = stk.data.packs[stk.tab];
    let head = '';
    if (p) head = `<div class="stk-head"><span>${esc(p.name)}</span><button class="mini-btn" data-act="stkPackDel" data-pack="${esc(p.id)}">${esc(p.owner === me.uid ? t('deletePack') : t('removePack'))}</button></div>`;
    const items = stkItems();
    $('stkGrid').innerHTML = head + (items.length
        ? `<div class="stk-cells">${items.map(s => `<div class="stk-cell" data-act="stkSend" data-img="${esc(s.imageId)}" data-pack="${esc(s.packId || '')}" data-del="${s.del ? '1' : ''}" data-kind="${s.kind}"><img alt=""></div>`).join('')}</div>`
        : `<div class="empty-note">${esc(t('stkEmpty'))}</div>`);
    $('stkGrid').querySelectorAll('.stk-cell').forEach(c => fillImg(c.firstChild, c.dataset.img, () => { c.style.opacity = '.3'; }));
}
A.stkTab = el => { stk.tab = el.dataset.tab; renderStk(); };
A.stkSend = el => {
    if (!chat) return;
    const s = { imageId: el.dataset.img, packId: el.dataset.pack || null };
    closeModal('packModal');
    const ctx = chat, m = baseMsg(ctx, { text: '', sticker: true, imageId: s.imageId });
    if (s.packId) m.packId = s.packId;
    pushRecent(s); clearReply();
    pushMsg(ctx, m).catch(e => toast(t('notSent') + errText(e)));
    if (stk.open && stk.tab === 'recent') renderStk();
};
A.stkPackDel = async el => {
    const id = el.dataset.pack, p = stk.data.packs[id]; if (!p) return;
    try {
        if (p.owner === me.uid) await db.ref('sticker_packs/' + id).remove();
        await db.ref(`user_packs/${me.uid}/${id}`).remove();
        delete stk.data.packs[id]; stk.tab = 'recent'; renderStk(); toast(t('packRemoved'));
    } catch (e) { toast(errText(e)); }
};
function stkCellMenu(cell) {
    const id = cell.dataset.img, pack = cell.dataset.pack, kind = cell.dataset.kind, canDel = cell.dataset.del === '1';
    const isFav = !!stk.data.fav[id];
    showModal(`<div class="profile-buttons col">
        <button data-act="stkFav" data-img="${esc(id)}" data-pack="${esc(pack)}">★ ${esc(isFav ? t('favRemove') : t('favAdd'))}</button>
        ${canDel ? `<button class="moder-choice-btn all" data-act="stkDel" data-img="${esc(id)}" data-pack="${esc(pack)}" data-kind="${esc(kind)}">✕ ${esc(t('stkDelete'))}</button>` : ''}
        <button class="moder-choice-btn cancel" data-act="closeModal">${esc(t('cancel'))}</button></div>`, 'stkMenu');
}
longPress($('stickerPanel'), '.stk-cell', cell => stkCellMenu(cell));
A.stkFav = async el => {
    closeModal('stkMenu');
    try { await toggleFav(el.dataset.img, el.dataset.pack || null); } catch (e) { toast(errText(e)); }
};
A.stkDel = async el => {
    closeModal('stkMenu');
    const id = el.dataset.img, pack = el.dataset.pack, kind = el.dataset.kind;
    try {
        if (pack) { await db.ref(`sticker_packs/${pack}/stickers/${id}`).remove(); if (stk.data.packs[pack]) delete stk.data.packs[pack].stickers[id]; }
        else if (kind === 'own') { await db.ref(`user_stickers/${me.uid}/own/${id}`).remove(); delete stk.data.own[id]; }
        renderStk(); toast(t('stkDeleted'));
    } catch (e) { toast(errText(e)); }
};
A.edSaveSticker = async () => {
    const btn = document.querySelector('[data-act="edSaveSticker"]'); if (btn) btn.disabled = true;
    try {
        let packId = null, name = '';
        if (ed.kind === 'pack') {
            const sel = $('packSel').value;
            if (sel === 'new') { name = $('packName').value.trim(); if (!name) { if (btn) btn.disabled = false; return toast(t('needPackName')); } }
            else packId = sel;
        }
        let data = await renderEdited(320, 'image/webp', 0.85);
        if (data.length > 600000) data = await renderEdited(240, 'image/webp', 0.7);
        const iref = db.ref('images').push();
        await iref.set(data);
        const id = iref.key;
        if (ed.kind === 'single') await db.ref(`user_stickers/${me.uid}/own/${id}`).set(true);
        else if (packId) await db.ref(`sticker_packs/${packId}/stickers/${id}`).set(true);
        else {
            const pk = db.ref('sticker_packs').push();
            await pk.set({ name, owner: me.uid, ts: Date.now(), stickers: { [id]: true } });
            await db.ref(`user_packs/${me.uid}/${pk.key}`).set(true);
            packId = pk.key;
        }
        imageCache[id] = Promise.resolve(data);
        await loadStk(true);
        closePhotoEditor(); toast(t('stkSaved'));
        stk.tab = packId || 'own';
        if (chat) { stk.open = true; $('stickerPanel').style.display = 'flex'; renderStk(); }
    } catch (e) { toast(t('errPrefix') + errText(e)); if (btn) btn.disabled = false; }
};
async function openPack(packId) {
    try {
        await loadStk();
        const s = await db.ref('sticker_packs/' + packId).once('value');
        if (!s.exists()) return toast(t('packGone'));
        const p = { id: packId, ...s.val() }, mine = !!stk.data.packs[packId], ids = Object.keys(p.stickers || {});
        const m = showModal(`<h3>${esc(p.name)}</h3><p class="muted">${esc(t('stickerCount', { n: ids.length }))}</p>
            <div class="stk-cells pack-view">${ids.map(id => `<div class="stk-cell" data-act="stkSend" data-img="${esc(id)}" data-pack="${esc(packId)}" data-kind="pack" data-del=""><img alt=""></div>`).join('')}</div>
            <div class="profile-buttons col">
                ${p.owner === me.uid ? '' : `<button data-act="packToggle" data-pack="${esc(packId)}">${esc(mine ? t('removePack') : t('addPack'))}</button>`}
                <button class="moder-choice-btn cancel" data-act="closeModal" data-modal="packModal">${esc(t('close'))}</button></div>`, 'packModal');
        m.querySelectorAll('.stk-cell').forEach(c => fillImg(c.firstChild, c.dataset.img));
        longPress(m, '.stk-cell', cell => stkCellMenu(cell));
    } catch (e) { toast(errText(e)); }
}
A.packToggle = async el => {
    const id = el.dataset.pack, has = !!stk.data.packs[id];
    try {
        await db.ref(`user_packs/${me.uid}/${id}`).set(has ? null : true);
        await loadStk(true); closeModal('packModal'); toast(has ? t('packRemoved') : t('packAdded'));
        if (stk.open) renderStk();
    } catch (e) { toast(errText(e)); }
};

/* ---------- НАСТРОЙКИ ---------- */
A.openSettings = () => {
    $('settings').style.display = 'flex'; SET.open = true; SET.sec = null;
    buildSide(); showSection(null);
};
A.closeSettings = () => { $('settings').style.display = 'none'; SET.open = false; };
function buildSide() {
    const items = [['account', ICON.user, t('account')], ['custom', '<span class="glyph">✦</span>', t('custom')], ['language', ICON.globe, t('language')]];
    if (isAdmin) items.push(['admin', '<span class="glyph">♛</span>', t('moderator')]);
    $('settingsSide').innerHTML = items.map(([id, ic, label]) =>
        `<button class="side-item${SET.sec === id ? ' active' : ''}" data-act="setSec" data-sec="${id}"><span class="side-ic">${ic}</span><span class="side-label">${esc(label)}</span></button>`).join('');
}
A.setSec = el => showSection(el.dataset.sec);
function showSection(sec) {
    SET.sec = sec; buildSide();
    const main = $('settingsMain');
    if (!sec) { main.innerHTML = `<div class="empty-note">${esc(t('pickSection'))}</div>`; return; }
    if (sec === 'account') return secAccount(main);
    if (sec === 'custom') return secCustom(main);
    if (sec === 'language') return secLang(main);
    if (sec === 'admin') return secAdmin(main);
}
async function secAccount(main) {
    main.innerHTML = '<div class="empty-note">…</div>';
    try {
        const [uS, fS, gS, av] = await Promise.all([
            db.ref('users/' + me.uid).once('value'),
            db.ref(`subscriptions/${me.uid}/followers`).once('value'),
            db.ref(`subscriptions/${me.uid}/following`).once('value'),
            getAvatar(me.uid, true)
        ]);
        if (SET.sec !== 'account') return;
        const d = uS.val() || {};
        const linkBox = me.isAnonymous ? `<div class="link-box"><b>${esc(t('linkTitle'))}</b><p class="muted">${esc(t('linkHint'))}</p>
                <input id="lkEmail" type="email" placeholder="${esc(t('email'))}" autocomplete="email">
                <input id="lkPass" type="password" placeholder="${esc(t('password'))}" autocomplete="new-password">
                <button data-act="linkEmail">${esc(t('linkEmail'))}</button>
                <button class="google-btn" data-act="linkGoogle">${GOOGLE_SVG}<span>${esc(t('google'))}</span></button></div>`
            : `<div class="acc-email">✉ ${esc(me.email || '')}</div>`;
        main.innerHTML = `<h3 class="sec-title">${esc(t('account'))}</h3>${linkBox}
            <div class="profile-avatar-wrapper"><div class="profile-avatar" id="myAv" data-act="viewAvatar">${avatarInner(av, d.nickname || myNick)}</div></div>
            <div class="avatar-upload-btn" id="avBtn" data-act="uploadAvatar">${esc(t('uploadPhoto'))}</div>
            <div class="profile-subs">
                <button data-act="followers" data-uid="${esc(me.uid)}"><span class="count">${Object.keys(fS.val() || {}).length}</span><span class="label">${esc(t('followers'))}</span></button>
                <button data-act="following" data-uid="${esc(me.uid)}"><span class="count">${Object.keys(gS.val() || {}).length}</span><span class="label">${esc(t('following'))}</span></button>
            </div>
            <div class="profile-field"><label>${esc(t('nick'))}</label><input id="pfNick" maxlength="20"></div>
            <div class="profile-field"><label>${esc(t('bio'))}</label><textarea id="pfBio" maxlength="200"></textarea></div>
            <div class="profile-field"><label>${esc(t('loc'))}</label><input id="pfLoc" maxlength="50"></div>
            <button class="full-btn" data-act="saveProfile">${esc(t('save'))}</button>
            <div class="profile-stats">✉️ ${d.messageCount || 0}<br><span class="uid-line">ID: ${esc(me.uid)}</span></div>
            <div class="profile-buttons col">
                <button class="moder-choice-btn me" data-act="signOut">${esc(t('signOut'))}</button>
                <button class="moder-choice-btn all" data-act="askDelAcc">${esc(t('deleteAccount'))}</button>
            </div>`;
        $('pfNick').value = d.nickname || myNick; $('pfBio').value = d.bio || ''; $('pfLoc').value = d.location || '';
    } catch (e) { main.innerHTML = `<div class="empty-note">${esc(errText(e))}</div>`; }
}
A.linkEmail = async () => {
    const em = $('lkEmail').value.trim(), pw = $('lkPass').value;
    if (!em || !pw) return toast(t('fillAll'));
    try {
        const r = await me.linkWithCredential(firebase.auth.EmailAuthProvider.credential(em, pw));
        me = r.user; r.user.sendEmailVerification().catch(() => {});
        toast(t('linked')); if (SET.sec === 'account') showSection('account');
    } catch (e) { const m = authErr(e); if (m) toast(m); }
};
A.linkGoogle = async () => {
    try {
        const r = await me.linkWithPopup(gProvider());
        me = r.user; toast(t('linked')); if (SET.sec === 'account') showSection('account');
    } catch (e) {
        if (popupFallback(e)) { try { await me.linkWithRedirect(gProvider()); } catch (x) {} return; }
        const m = authErr(e); if (m) toast(m);
    }
};
A.saveProfile = async () => {
    const nn = $('pfNick').value.trim(); if (!nn) return toast(t('nickEmpty'));
    try {
        await db.ref('users/' + me.uid).update({ nickname: nn, bio: $('pfBio').value.trim(), location: $('pfLoc').value.trim() });
        myNick = nn; delete userCache[me.uid]; toast(t('saved'));
    } catch (e) { toast(errText(e)); }
};
/* аватарка: сначала редактор (кроп квадратом), потом сохранение */
A.uploadAvatar = async () => {
    const f = await pickImage(); if (!f) return;
    try { openPhotoEditor(await readFile(f), 'avatar'); } catch (e) { toast(t('errPrefix') + errText(e)); }
};
function secCustom(main) {
    const bg = store.get('chatBg', ''), z = store.get('uiScale', '100'), f = store.get('textSize', '15');
    main.innerHTML = `<h3 class="sec-title">✦ ${esc(t('custom'))}</h3>
        <div class="set-group"><label>${esc(t('theme'))}</label>
            <div class="seg"><button data-act="theme" data-theme="light">☀ ${esc(t('light'))}</button><button data-act="theme" data-theme="dark">☾ ${esc(t('dark'))}</button></div></div>
        <div class="set-group"><label>${esc(t('color'))}</label>
            <div class="menu-themes">${COLORS.map(c => `<div class="theme-btn theme-btn-${c}" data-act="color" data-color="${c}"></div>`).join('')}</div></div>
        <div class="set-group"><label>${esc(t('chatBg'))}</label><p class="muted">${esc(t('bgHint'))}</p>
            <div class="chat-bg-preview${bg ? ' has-bg' : ''}" style="${bg ? `background-image:url('${bg}')` : ''}">${bg ? '' : esc(t('noBg'))}</div>
            <div class="profile-buttons"><button data-act="bgPick">${esc(t('pickPhoto'))}</button><button class="moder-choice-btn cancel" data-act="bgClear">${esc(t('clearBg'))}</button></div></div>
        <div class="set-group"><label>${esc(t('uiScale'))}: <b id="zVal"></b></label><input type="range" id="rngZoom" min="80" max="130" step="5" value="${esc(z)}"></div>
        <div class="set-group"><label>${esc(t('textSize'))}: <b id="fVal"></b></label><input type="range" id="rngFont" min="12" max="22" step="1" value="${esc(f)}">
            <div class="sample-msg">${esc(t('textSample'))}</div></div>`;
    applyTheme(); applyScale();
}
function secLang(main) {
    main.innerHTML = `<h3 class="sec-title">${ICON.globe} ${esc(t('language'))}</h3>` +
        Object.entries(LANGS).map(([code, name]) =>
            `<button class="lang-item${lang === code ? ' active' : ''}" data-act="setLang" data-lang="${code}"><span>${esc(name)}</span>${lang === code ? ICON.check : ''}</button>`).join('');
}
function secAdmin(main) {
    main.innerHTML = `<h3 class="sec-title">♛ ${esc(t('moderator'))}</h3>
        <button class="moder-choice-btn all" data-act="adminClear">${esc(t('clearGeneral'))}</button>`;
}
A.adminClear = async () => {
    if (!isAdmin || !confirm(t('clearConfirm'))) return;
    try { await db.ref('messages').remove(); toast(t('cleared')); } catch (e) { toast(errText(e)); }
};

/* ---------- УДАЛЕНИЕ АККАУНТА ---------- */
A.askDelAcc = () => {
    const m = showModal(`<div class="modal-top"><button class="icon-btn" data-act="closeModal" data-modal="delAcc">✕</button></div>
        <h3>${esc(t('delTitle'))}</h3><p class="muted">${esc(t('delWarn'))}</p>
        <div class="profile-buttons">
            <button class="moder-choice-btn cancel" data-act="closeModal" data-modal="delAcc">${esc(t('no'))}</button>
            <button class="moder-choice-btn all" id="delYes" data-act="delAccYes" disabled>${esc(t('yes'))} (5)</button>
        </div>`, 'delAcc');
    let n = 5;
    const iv = setInterval(() => {
        const b = $('delYes'); if (!b) return clearInterval(iv);
        n--;
        if (n > 0) b.textContent = `${t('yes')} (${n})`;
        else { b.textContent = t('yes'); b.disabled = false; clearInterval(iv); }
    }, 1000);
    m._onClose = () => clearInterval(iv);
};
A.delAccYes = async () => {
    if ($('delYes') && $('delYes').disabled) return;
    const uid = me.uid, user = me;
    closeModal('delAcc');
    try { if (!(await reauth(user))) return; } catch (e) { const m = authErr(e); return m && toast(m); }
    try {
        const ups = {};
        const [f, g, uc] = await Promise.all([
            db.ref(`subscriptions/${uid}/followers`).once('value'),
            db.ref(`subscriptions/${uid}/following`).once('value'),
            db.ref(`user_chats/${uid}`).once('value')
        ]);
        Object.keys(f.val() || {}).forEach(o => { ups[`subscriptions/${o}/following/${uid}`] = null; ups[`subscriptions/${uid}/followers/${o}`] = null; });
        Object.keys(g.val() || {}).forEach(o => { ups[`subscriptions/${o}/followers/${uid}`] = null; ups[`subscriptions/${uid}/following/${o}`] = null; });
        Object.keys(uc.val() || {}).forEach(o => { ups[`user_chats/${o}/${uid}`] = null; ups[`user_chats/${uid}/${o}`] = null; });
        ups[`users/${uid}`] = null; ups[`avatars/${uid}`] = null; ups[`user_stickers/${uid}`] = null; ups[`user_packs/${uid}`] = null;
        ups[`hidden_messages/${uid}`] = null; ups[`hidden_pm/${uid}`] = null; ups[`hidden_chats/${uid}`] = null;
        resetSession();
        await db.ref(`users/${uid}/online`).onDisconnect().cancel().catch(() => {});
        await db.ref(`users/${uid}/lastSeen`).onDisconnect().cancel().catch(() => {});
        await db.ref().update(ups);
        store.del('migrated_chats_v2_' + uid); store.del('recentStk_' + uid);
        try { await user.delete(); } catch (e) { await auth.signOut().catch(() => {}); }
        toast(t('accDeleted'));
    } catch (e) { toast(t('errPrefix') + errText(e)); }
};

/* ---------- ЧУЖОЙ ПРОФИЛЬ ---------- */
async function showUserProfile(uid) {
    if (!uid) return;
    if (uid === me.uid) { A.openSettings(); showSection('account'); return; }
    const m = showModal('<div class="empty-note">…</div>', 'profileModal');
    try {
        const [u, av, f, g, iF] = await Promise.all([
            db.ref('users/' + uid).once('value'), getAvatar(uid, true),
            db.ref(`subscriptions/${uid}/followers`).once('value'), db.ref(`subscriptions/${uid}/following`).once('value'),
            db.ref(`subscriptions/${me.uid}/following/${uid}`).once('value')
        ]);
        if ($('profileModal') !== m) return;
        const d = u.val() || {}, nick = d.nickname || t('anon'), [st, sc] = fmtStatus(d);
        setModal(m, `<h3>${esc(t('profile'))}</h3>
            <div class="profile-avatar-wrapper"><div class="profile-avatar" data-act="viewAvatar">${avatarInner(av, nick)}</div><span class="online-dot ${sc}" id="pfDot"></span></div>
            <div class="profile-status ${sc}" id="pfStatus">${esc(st)}</div>
            <div class="profile-subs">
                <button data-act="followers" data-uid="${esc(uid)}"><span class="count" id="fCount">${Object.keys(f.val() || {}).length}</span><span class="label">${esc(t('followers'))}</span></button>
                <button data-act="following" data-uid="${esc(uid)}"><span class="count">${Object.keys(g.val() || {}).length}</span><span class="label">${esc(t('following'))}</span></button>
            </div>
            <button class="subscribe-btn${iF.exists() ? ' subscribed' : ''}" data-act="subscribe" data-uid="${esc(uid)}">${esc(iF.exists() ? t('subscribed') : t('subscribe'))}</button>
            <div class="profile-field"><label>${esc(t('nick'))}</label><div class="profile-view-field">${esc(nick)}</div></div>
            <div class="profile-field"><label>${esc(t('bio'))}</label><div class="profile-view-field multiline">${esc(d.bio || t('nothingTold'))}</div></div>
            <div class="profile-field"><label>${esc(t('loc'))}</label><div class="profile-view-field">${esc(d.location || '—')}</div></div>
            <div class="profile-stats">✉️ ${d.messageCount || 0}</div>
            <button class="orange-btn" data-act="writePm" data-uid="${esc(uid)}">${esc(t('write'))}</button>
            <button class="full-btn" data-act="closeModal" data-modal="profileModal">${esc(t('close'))}</button>`);
        const ref = db.ref('users/' + uid);
        const cb = s => {
            const [tx, c] = fmtStatus(s.val() || {});
            const se = $('pfStatus'), de = $('pfDot');
            if (se) { se.textContent = tx; se.className = 'profile-status ' + c; }
            if (de) de.className = 'online-dot ' + c;
        };
        ref.on('value', cb); m._onClose = () => ref.off('value', cb);
    } catch (e) { closeModal('profileModal'); toast(errText(e)); }
}
A.writePm = el => { A.closeSettings(); openChat('pm', el.dataset.uid); };

/* ---------- ПОДПИСКИ ---------- */
let subBusy = false;
A.subscribe = async el => {
    const uid = el.dataset.uid;
    if (subBusy || !uid || uid === me.uid) return;
    subBusy = true; el.style.pointerEvents = 'none';
    try {
        const on = (await db.ref(`subscriptions/${me.uid}/following/${uid}`).once('value')).exists();
        await db.ref().update({ [`subscriptions/${me.uid}/following/${uid}`]: on ? null : true, [`subscriptions/${uid}/followers/${me.uid}`]: on ? null : true });
        el.textContent = on ? t('subscribe') : t('subscribed'); el.classList.toggle('subscribed', !on);
        const fc = $('fCount');
        if (fc) fc.textContent = Object.keys((await db.ref(`subscriptions/${uid}/followers`).once('value')).val() || {}).length;
        toast(on ? t('subOff') : t('subOn'));
    } catch (e) { toast(errText(e)); }
    subBusy = false; el.style.pointerEvents = '';
};
async function showUsersList(title, uids, ownFollowers) {
    const users = await Promise.all(uids.map(u => getUser(u, true).then(d => ({ uid: u, ...d }))));
    const rows = users.length ? users.map(u => `
        <div class="user-item" data-act="openFromList" data-uid="${esc(u.uid)}">
            <div class="user-item-avatar">${avatarInner(u.avatar, u.nickname)}</div>
            <div class="user-item-info"><div class="user-item-nick">${esc(u.nickname || t('anon'))}</div>
            <div class="user-item-status ${u.online === true ? 'online' : ''}">${u.online === true ? '🟢 ' + esc(t('online')) : '⚫ ' + esc(t('offline'))}</div></div>
            ${ownFollowers ? `<button class="user-item-delete" data-act="removeFollower" data-uid="${esc(u.uid)}">✕</button>` : ''}
        </div>`).join('') : `<div class="empty-note">${esc(t('empty'))}</div>`;
    showModal(`<h3>${esc(title)}</h3><div class="users-list">${rows}</div><button class="full-btn" data-act="closeModal" data-modal="listModal">${esc(t('close'))}</button>`, 'listModal');
}
A.followers = async el => {
    const s = await db.ref(`subscriptions/${el.dataset.uid}/followers`).once('value');
    showUsersList(t('followers'), Object.keys(s.val() || {}), el.dataset.uid === me.uid);
};
A.following = async el => {
    const s = await db.ref(`subscriptions/${el.dataset.uid}/following`).once('value');
    showUsersList(t('following'), Object.keys(s.val() || {}), false);
};
A.openFromList = el => { closeModal('listModal'); showUserProfile(el.dataset.uid); };
A.removeFollower = async (el, e) => {
    e.stopPropagation();
    const uid = el.dataset.uid;
    if (!confirm(t('removeFollower'))) return;
    try {
        await db.ref().update({ [`subscriptions/${me.uid}/followers/${uid}`]: null, [`subscriptions/${uid}/following/${me.uid}`]: null });
        el.closest('.user-item')?.remove(); toast(t('followerRemoved'));
    } catch (err) { toast(errText(err)); }
};

/* ---------- СТАРТ ---------- */
$('nickBtn').addEventListener('click', saveNickname);
$('nicknameInput').addEventListener('keydown', e => { if (e.key === 'Enter') saveNickname(); });
applyTheme(); applyScale(); applyLang();
