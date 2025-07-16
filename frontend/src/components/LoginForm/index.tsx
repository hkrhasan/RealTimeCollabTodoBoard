import type { FC } from 'react';
import { useFormik } from 'formik';
import { z } from 'zod';
import { Input } from '../Input';
import useAuth from '../../hooks/useAuth';

export interface LoginFormProps {
  className?: string;
  onRegisterClick?: () => void;
  credentials?: LoginValues
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const LoginForm: FC<LoginFormProps> = ({ className = '', onRegisterClick, credentials }) => {
  const authState = useAuth()
  const formik = useFormik<LoginValues>({
    initialValues: {
      email: credentials?.email || '',
      password: credentials?.password || '',
    },
    validate: (values) => {
      try {
        loginSchema.parse(values);
        return {};
      } catch (err) {
        const zodError = err as z.ZodError<LoginValues>;
        const fieldErrors: Record<string, string> = {};
        const fieldErrorsObj = zodError.flatten().fieldErrors;
        Object.entries(fieldErrorsObj).forEach(([key, errors]) => {
          if (errors && errors.length > 0) {
            fieldErrors[key] = errors[0]!;
          }
        });
        return fieldErrors;
      }
    },
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      await authState.login(values);
      setSubmitting(false);
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className={`auth-form ${className}`}
      noValidate
    >
      <div className="auth-header">
        <h2>Login to your account</h2>
        <p>Enter your email below to login to your account</p>
      </div>

      <div className="auth-fields">
        <Input
          label="Email"
          name="email"
          placeholder="m@example.com"
          type="email"
          className="auth-field"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={(formik.touched.email && formik.errors.email) ? formik.errors.email : undefined}
        />

        <Input
          label="Password"
          name="password"
          placeholder="**********"
          type="password"
          className="auth-field"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={(formik.touched.password && formik.errors.password) ? formik.errors.password : undefined}
        />

      </div>

      <div className="auth-actions">
        <button
          type="submit"
          className="button"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        <p>
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="button-link"
            onClick={onRegisterClick}
          >
            Sign Up
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
