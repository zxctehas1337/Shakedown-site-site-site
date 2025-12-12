import type { TranslationStructure } from './types'

export const ruTranslations: TranslationStructure = {
  // Навигация
  nav: {
    services: 'Цены',
    video: 'Видео',
    news: 'Новости',
    dashboard: 'Личный кабинет',
    home: 'Главная',
    admin: 'Админ',
    logout: 'Выйти'
  },
  // Hero секция
  hero: {
    title: 'ShakeDown',
    subtitle: 'Мы предоставляем вам лучший клиент для комфортной игры, который даст вам наилучшие впечатления от игры.',
    cta: 'Начать играть',
    learnMore: 'Подробнее'
  },
  // Видео секция
  video: {
    title: 'Видеообзор',
    subtitle: 'Посмотрите, как работает наш клиент'
  },
  // Услуги
  services: {
    title: 'Наши цены',
    popular: 'Популярно',
    discount: 'Скидка',
    pay: 'Оплатить'
  },
  // Функции
  features: {
    ourAdvantages: 'Наши\nпреимущества',
    ourAdvantagesDesc: 'Мы кратко изложили вам то, что вы гарантированно получите после покупки нашего клиента.',
    performance: 'Высокая производительность',
    performanceDesc: 'Оптимизированный код без просадок FPS',
    bypass: 'Лучшие обходы',
    bypassDesc: 'Непробиваемые обходы античитов с постоянными обновлениями',
    interface: 'Красивый внешний вид',
    interfaceDesc: 'Современный GUI с темами и настройками',
    interfaceDescFull: 'В нашем клиенте присутствует большое количество визуальных функций, которые сделают вашу игру более красочной. А так же вы можете настроить оформление клиента под себя, сделав его по настоящему красивым.',
    customization: 'Настраиваемость',
    customizationDesc: 'В нашем клиенте вы можете настроить практически любую функцию под себя, а так же использовать конфигурации других пользователей. Благодаря этому вы сможете использовать наш клиент на максимуме его возможностей.',
    optimization: 'Оптимизация',
    optimizationDesc: 'Мы постоянно улучшаем оптимизацию нашего клиента и самой игры. Благодаря этому вы сможете запустить наш клиент даже на слабых компьютерах.',
    updates: 'Частые обновления',
    updatesDesc: 'Еженедельные обновления с новыми функциями',
    updatesDescFull: 'Мы регулярно обновляем функционал в нашем клиенте, добавляя новые функции, а так же совершенствуя уже существующие. Благодаря этому наш клиент имеет преимущества под все существующие сервера.',
    richFunctionality: 'Богатый функционал',
    richFunctionalityDesc: 'Более 100 модулей для всех аспектов игры',
    support: 'Лучшая поддержка',
    supportDesc: 'Круглосуточная помощь и активное сообщество',
    supportDescFull: 'У нас самая лучшая поддержка, которая разбирается в своём деле и сможет помочь вам по любому вопросу связанному с нашим клиентом.'
  },
  // Footer
  footer: {
    rights: 'Все права защищены'
  },
  // Dashboard
  dashboard: {
    title: 'Личный кабинет',
    uid: 'UID',
    login: 'Логин',
    group: 'Группа',
    regDate: 'Дата регистрации',
    lastLogin: 'Последний вход',
    email: 'E-mail',
    hwid: 'HWID',
    hwidPlaceholder: 'Будет получен от лаунчера',
    reset: 'Сбросить',
    activateKey: 'Активация ключа',
    enterKey: 'Введите ключ',
    activate: 'Активировать',
    buyClient: 'Купить клиент',
    downloadLauncher: 'Скачать лаунчер',
    changePassword: 'Сменить пароль',
    user: 'Пользователь',
    premium: 'Premium',
    alpha: 'Alpha'
  },
  // Модальное окно оплаты
  payment: {
    title: 'Выберите способ оплаты',
    selectProduct: 'Выберите товар',
    selectPlaceholder: '-- Выберите товар --',
    promo: 'Промокод (необязательно)',
    promoPlaceholder: 'Введите промокод',
    toPay: 'К оплате',
    paymentMethod: 'Способ оплаты',
    continue: 'Продолжить',
    note: 'После оплаты клиент будет автоматически активирован на вашем аккаунте',
    cards: 'Карты, СБП, кошельки',
    gameMarket: 'Игровая площадка'
  },
  // Auth страница
  auth: {
    login: 'Вход',
    register: 'Регистрация',
    loginOrEmail: 'Логин или Email',
    enterLoginOrEmail: 'Введите логин или email',
    password: 'Пароль',
    enterPassword: 'Введите пароль',
    rememberMe: 'Запомнить меня',
    loginBtn: 'Войти',
    username: 'Логин',
    createUsername: 'Придумайте логин',
    email: 'Email',
    enterEmail: 'Введите email',
    createPassword: 'Придумайте пароль',
    confirmPassword: 'Подтвердите пароль',
    repeatPassword: 'Повторите пароль',
    agreeTerms: 'Я согласен с условиями использования',
    registerBtn: 'Зарегистрироваться',
    backToHome: 'Вернуться на главную',
    orContinueWith: 'или продолжить через',
    emailVerification: 'Подтверждение Email',
    verificationSent: 'Мы отправили 6-значный код на вашу почту. Введите его ниже:',
    confirm: 'Подтвердить',
    verifying: 'Проверка...',
    resendCode: 'Отправить код повторно',
    enterFullCode: 'Введите полный код',
    passwordsNotMatch: 'Пароли не совпадают',
    passwordMinLength: 'Пароль должен быть не менее 6 символов',
    mustAgreeTerms: 'Необходимо согласиться с условиями'
  },
  // Товары
  products: {
    client30: 'Клиент на 30 дней',
    client30Desc: 'Доступ к клиенту на 30 дней',
    client90: 'Клиент на 90 дней',
    client90Desc: 'Доступ к клиенту на 90 дней',
    clientLifetime: 'Клиент навсегда',
    clientLifetimeDesc: 'Пожизненный доступ к клиенту',
    hwidReset: 'Сброс привязки',
    hwidResetDesc: 'Сброс HWID привязки',
    premium30: 'Premium на 30 дней',
    premium30Desc: 'Premium статус на 30 дней',
    alpha: 'ALPHA 1.16.5',
    alphaDesc: 'Клиент для версии 1.16.5',
    fullFeatures: 'Полный функционал',
    updates: 'Обновления',
    support: 'Поддержка',
    prioritySupport: 'Приоритетная поддержка',
    allUpdates: 'Все обновления',
    instantReset: 'Мгновенный сброс',
    newBinding: 'Новая привязка',
    exclusiveFeatures: 'Эксклюзивные функции',
    priorityQueue: 'Приоритет в очереди',
    uniqueFeatures: 'Уникальные функции'
  }
}