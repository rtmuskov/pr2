import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { appPaths } from '../../app/paths';
import { useAuth } from '../../app/providers/AuthProvider';
import { PageHero } from '../../components/ui/PageHero';

export function RegisterPage() {
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to={appPaths.profile} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ username, email, password });
      navigate(appPaths.profile, { replace: true });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Не удалось создать аккаунт. Попробуйте еще раз.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="stack-layout">
      <PageHero
        eyebrow="Регистрация"
        title="Создание аккаунта"
        description="После регистрации автоматически создаются пользователь, профиль и начальный прогресс."
      />

      <section className="panel-card auth-card">
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span>Username</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="qa_inspector"
                minLength={3}
                required
              />
            </label>

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
          </div>

          <label className="form-field">
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Не менее 6 символов"
              minLength={6}
              required
            />
          </label>

          {error ? <p className="form-error-text">{error}</p> : null}

          <div className="page-actions">
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создаем аккаунт...' : 'Зарегистрироваться'}
            </button>
            <Link className="secondary-button" to={appPaths.login}>
              Уже есть аккаунт
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
