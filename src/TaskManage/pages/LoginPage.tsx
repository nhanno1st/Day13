import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useAuthStore } from "../store/useAuthStore";
import apiClient from "../lib/api-client";

interface LoginFormValues {
  userName: string;
  password: string;
}

const schema = yup.object().shape({
  userName: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Min 8 characters')
    .matches(/\d/, 'Must include a number')
    .matches(/^\S*$/, 'No spaces allowed')
    .required('Password is required'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore(); // gọi login từ store zustand

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      userName: "tungnt@softech.vn",
      password: "123456789",
    },
    mode: "onChange",
  });

  const onSubmit = (data: LoginFormValues) => {
  login({
    username: data.userName,
    password: data.password,
    navigate,
  });
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 via-white to-blue-100 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300">
        <h2 className="text-3xl font-bold text-blue-700 mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-500 text-center mb-6">Please login to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="userName" className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                id="userName"
                type="email"
                {...register("userName")}
                placeholder="Enter your email"
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
            {errors.userName && (
              <p className="text-red-500 text-xs mt-1">{errors.userName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
              <FaLock className="text-gray-400 mr-2" />
              <input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter your password"
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-2 rounded-lg text-white font-semibold text-sm transition-all duration-200 shadow ${
              isValid
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Sign In
          </button>

          <div className="text-center">
            <p className={`text-sm ${isValid ? "text-green-600" : "text-red-500"}`}>
              {isValid ? "✓ Ready to submit" : "Please correct the errors above"}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
