import type { FC } from 'react';
import { useFormik } from 'formik';
import { z } from 'zod';
import { Input } from '../Input';
import type { LoginValues } from '../LoginForm';
import useAuth from '../../hooks/useAuth';

export interface RegisterFormProps {
  className?: string;
  onLoginClick: () => void;
  postRegister?: (payload: LoginValues) => void;
}

const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const RegisterForm: FC<RegisterFormProps> = ({ className = '', onLoginClick, postRegister }) => {
  const authState = useAuth()
  const formik = useFormik<RegisterValues>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: (values) => {
      try {
        registerSchema.parse(values);
        return {};
      } catch (err) {
        const zodError = err as z.ZodError<RegisterValues>;
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
      await authState.register(values)
      if (postRegister) {
        postRegister({ email: values.email, password: values.password })
      }
      onLoginClick();
      setSubmitting(false);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className={`auth-form ${className}`} noValidate>
      <div className="auth-header">
        <h2>Create an account</h2>
        <p>Enter your email below to create your account</p>
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
          error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
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
          error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          placeholder="**********"
          type="password"
          className="auth-field"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : undefined}
        />
      </div>

      <div className="auth-actions">
        <button type="submit" className="button" disabled={formik.isSubmitting || authState.isLoading}>
          {(formik.isSubmitting || authState.isLoading) ? 'Registering...' : 'Register'}
        </button>
        <p>
          Already have an account?{' '}
          <button type="button" className="button-link" onClick={onLoginClick}>
            Login
          </button>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
