import { firebaseAuth, googleProvider } from '@/lib/firebase';
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { Cloud, LoaderCircle } from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';

interface Props {
  children: (user: User) => ReactNode;
}

type AuthAction = 'login' | 'register' | 'google' | null;

export function FirebaseAuthGate({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<AuthAction>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(
    () =>
      onAuthStateChanged(firebaseAuth, nextUser => {
        setUser(nextUser);
        setLoading(false);
      }),
    [],
  );

  const runEmailAuth = async (nextAction: 'login' | 'register') => {
    setAction(nextAction);
    setError('');
    try {
      if (nextAction === 'register') {
        await createUserWithEmailAndPassword(
          firebaseAuth,
          email.trim(),
          password,
        );
      } else {
        await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      }
    } catch (reason) {
      setError(getAuthError(reason, nextAction));
    } finally {
      setAction(null);
    }
  };

  const submitLogin = (event: FormEvent) => {
    event.preventDefault();
    void runEmailAuth('login');
  };

  const loginWithGoogle = async () => {
    setAction('google');
    setError('');
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
    } catch (reason) {
      setError(getAuthError(reason, 'google'));
    } finally {
      setAction(null);
    }
  };

  if (loading) {
    return (
      <main className="firebase-login-page" aria-label="正在加载登录状态">
        <LoaderCircle className="firebase-login-spinner" />
      </main>
    );
  }
  if (user) return <>{children(user)}</>;

  const busy = action !== null;

  return (
    <main className="firebase-login-page">
      <section className="firebase-login-card">
        <div className="firebase-login-mark">
          <Cloud size={25} strokeWidth={1.5} />
        </div>
        <span>MY DAILY · MY LIFE</span>
        <h1>记录生活，也把它安心保存</h1>
        <p>使用邮箱登录，在不同设备间同步你的日常记录。</p>

        <form className="firebase-email-form" onSubmit={submitLogin}>
          <label>
            <span>邮箱</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span>密码</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="至少 6 位密码"
              minLength={6}
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
            />
          </label>
          <div className="firebase-email-actions">
            <button type="submit" disabled={busy}>
              {action === 'login' && (
                <LoaderCircle className="firebase-button-spinner" />
              )}
              登录
            </button>
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={() => void runEmailAuth('register')}
            >
              {action === 'register' && (
                <LoaderCircle className="firebase-button-spinner" />
              )}
              注册
            </button>
          </div>
        </form>

        <div className="firebase-login-divider">
          <span>或</span>
        </div>
        <button
          type="button"
          className="firebase-google-button"
          onClick={() => void loginWithGoogle()}
          disabled={busy}
        >
          {action === 'google' ? (
            <LoaderCircle className="firebase-button-spinner" />
          ) : (
            <GoogleMark />
          )}
          用 Google 登录
        </button>
        {error && <small>{error}</small>}
      </section>
    </main>
  );
}

function getAuthError(reason: unknown, action: AuthAction) {
  const code = (reason as { code?: string }).code;
  const messages: Record<string, string> = {
    'auth/email-already-in-use': '这个邮箱已经注册，请直接登录',
    'auth/invalid-credential': '邮箱或密码不正确',
    'auth/invalid-email': '请输入有效的邮箱地址',
    'auth/missing-password': '请输入密码',
    'auth/weak-password': '密码强度不足，请设置至少 6 位密码',
    'auth/too-many-requests': '尝试次数过多，请稍后再试',
    'auth/network-request-failed': '网络连接失败，请检查网络后重试',
    'auth/operation-not-allowed': 'Firebase 尚未开启邮箱/密码登录方式',
    'auth/popup-closed-by-user': '登录窗口已关闭，请重新尝试',
    'auth/unauthorized-domain': '当前网站域名尚未加入 Firebase 授权域名',
  };
  return (
    messages[code ?? ''] ??
    (action === 'google'
      ? 'Google 登录失败，请检查网络后重试'
      : '操作失败，请稍后重试')
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285f4"
        d="M21.35 12.2c0-.7-.06-1.2-.2-1.73H12v3.32h5.37a4.63 4.63 0 0 1-2 3.02v2.16h3.23c1.9-1.75 2.75-4.34 2.75-6.77Z"
      />
      <path
        fill="#34a853"
        d="M12 21.7c2.62 0 4.83-.86 6.44-2.34l-3.23-2.5c-.87.58-1.98.98-3.21.98-2.53 0-4.67-1.7-5.44-4.02H3.23v2.57A9.72 9.72 0 0 0 12 21.7Z"
      />
      <path
        fill="#fbbc05"
        d="M6.56 13.82a5.84 5.84 0 0 1 0-3.64V7.61H3.23a9.72 9.72 0 0 0 0 8.78l3.33-2.57Z"
      />
      <path
        fill="#ea4335"
        d="M12 6.16c1.43 0 2.72.5 3.73 1.46l2.78-2.73A9.32 9.32 0 0 0 3.23 7.61l3.33 2.57C7.33 7.86 9.47 6.16 12 6.16Z"
      />
    </svg>
  );
}
