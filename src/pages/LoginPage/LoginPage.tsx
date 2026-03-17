import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { useAuth } from '../../app/providers/AuthProvider';
import { PageHero } from '../../components/ui/PageHero';

type LocationState = {
  from?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectPath = (location.state as LocationState | null)?.from ?? appPaths.profile;

  if (user) {
    return <Navigate to={redirectPath} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(redirectPath, { replace: true });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Не удалось выполнить вход. Попробуйте еще раз.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="stack-layout">
      <PageHero
        eyebrow="Авторизация"
        title="Вход в аккаунт"
        description="Войдите, чтобы сохранить свой прогресс, открыть профиль и работать с серверными данными."
      />

      <section className="panel-card auth-card">
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="inspector@example.com"
              required
            />
          </label>

          <label className="form-field">
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
              minLength={6}
              required
            />
          </label>

          {error ? <p className="form-error-text">{error}</p> : null}

          <div className="page-actions">
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Входим...' : 'Войти'}
            </button>
            <Link className="secondary-button" to={appPaths.register}>
              Создать аккаунт
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
