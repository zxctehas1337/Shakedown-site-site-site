import Footer from '../components/Footer'
import Navigation from '../components/Navigation'
import '../styles/home/index.css'
import { getCurrentLanguage, Language } from '../utils/translations'
import { useEffect, useState } from 'react'

export default function UserAgreementPage() {
  const [lang, setLang] = useState<Language>(getCurrentLanguage())

  useEffect(() => {
    const handleStorageChange = () => {
      setLang(getCurrentLanguage())
    }
    window.addEventListener('storage', handleStorageChange)

    const interval = setInterval(() => {
      const newLang = getCurrentLanguage()
      if (newLang !== lang) {
        setLang(newLang)
      }
    }, 100)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [lang])

  const handleLanguageChange = () => {
    setLang(getCurrentLanguage())
  }

  return (
    <div className="home-page">
      <Navigation onLanguageChange={handleLanguageChange} />
      <section className="features-section" style={{ paddingTop: '120px' }}>
        <div className="container">
          <h1 className="section-title">Пользовательское соглашение</h1>
          <p className="section-subtitle" style={{ maxWidth: '900px' }}>
            Используя сайт и сервисы проекта, вы соглашаетесь с условиями ниже.
          </p>

          <div style={{ maxWidth: '900px', margin: '0 auto', color: '#9ca3af', lineHeight: 1.6, fontSize: '0.95rem' }}>
            <h2 style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.25rem' }}>Термины</h2>
            <p>
              «Проект/Сервис» — сайт, личный кабинет, лаунчер, API и связанные с ними сервисы. «Пользователь» — лицо,
              использующее сервисы проекта. «Продукт» — цифровой функционал/подписка, предоставляемые в рамках проекта.
            </p>

            <h2 style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.25rem' }}>Предмет соглашения</h2>
            <p>
              Мы предоставляем доступ к функционалу сайта/личного кабинета, покупке подписок и получению обновлений.
            </p>

            <h2 style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.25rem' }}>Регистрация и использование</h2>
            <p>
              Для использования части функционала требуется аккаунт. Вы обязуетесь указывать достоверные данные при
              регистрации и поддерживать их актуальность.
            </p>
            <p>
              Вы несёте ответственность за сохранность учетных данных и за действия, совершенные под вашим аккаунтом.
              Передача аккаунта и совместное использование доступа третьими лицами запрещены.
            </p>

            <h2 style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.25rem' }}>Ответственность</h2>
            <p>
              Вы используете сервис на свой риск. Мы не несем ответственности за ограничения со стороны сторонних
              платформ/серверов.
            </p>
            <p>
              Мы не гарантируем, что сервис будет работать без ошибок и перерывов, однако прикладываем разумные усилия
              для поддержания стабильности и безопасности.
            </p>

            <h2 style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.25rem' }}>Оплата и доступ</h2>
            <p>
              Оплата открывает доступ к выбранному продукту на указанный срок. Возвраты/отмена — в рамках политики
              проекта.
            </p>

            <h2 style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.25rem' }}>Возвраты и отмена</h2>
            <p>
              Поскольку предоставляются цифровые услуги/доступ к цифровому продукту, возврат может быть ограничен после
              начала предоставления доступа (активации подписки/выдачи ключа/открытия функционала). В спорных случаях
              решение принимается индивидуально поддержкой, с учетом фактического использования продукта и признаков
              злоупотреблений.
            </p>

            <h2 style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.25rem' }}>Изменение условий</h2>
            <p>
              Мы можем изменять условия настоящего соглашения и связанные документы (правила, политика обработки данных).
              Актуальная версия публикуется на сайте и вступает в силу с момента публикации.
            </p>

            <h2 style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.25rem' }}>Урегулирование споров</h2>
            <p>
              По вопросам работы сервиса и платежей сначала обратитесь в поддержку. Мы постараемся урегулировать спор в
              досудебном порядке. При невозможности урегулирования спор рассматривается в порядке, установленном
              применимым законодательством.
            </p>

            <h2 style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.25rem' }}>Принятие условий</h2>
            <p>
              Продолжая пользоваться сервисом, вы подтверждаете, что ознакомились с правилами и принимаете их.
            </p>

            <h2 style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.25rem' }}>Контакты</h2>
            <p>
              По вопросам соглашения, оплаты и доступа обращайтесь в поддержку через официальные каналы проекта,
              указанные на сайте.
            </p>
          </div>
        </div>
      </section>
      <Footer lang={lang} />
    </div>
  )
}
