
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { login, register } from '@/utils/auth';
import { SproutIcon } from "lucide-react";

const loginFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const registerFormSchema = loginFormSchema.extend({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  })
});

const Login = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check URL parameters to determine if we should show the register form
    const searchParams = new URLSearchParams(location.search);
    const showRegister = searchParams.get('register');
    if (showRegister === 'true') {
      setIsLogin(false);
    }
  }, [location]);
  
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmitLogin = async (values: z.infer<typeof loginFormSchema>) => {
    setIsLoading(true);
    try {
      const { success, error } = await login(values.email, values.password);
      if (success) {
        toast({
          title: "Login successful!",
          description: "Welcome to SustainCityPlanner.",
        });
        navigate('/home');
      } else {
        toast({
          title: "Login failed",
          description: error || "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitRegister = async (values: z.infer<typeof registerFormSchema>) => {
    setIsLoading(true);
    try {
      const { success, error } = await register(values.email, values.password, values.name);
      if (success) {
        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account.",
        });
        // Some Supabase configs require email verification before login
        // so we'll stay on the login page
        setIsLogin(true);
      } else {
        toast({
          title: "Registration failed",
          description: error || "This email may already be in use.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-teal-50 to-background">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-3">
          <SproutIcon className="h-10 w-10 text-teal-600 mr-2" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-transparent bg-clip-text">
            SustainCityPlanner
          </h1>
        </div>
        <p className="text-muted-foreground max-w-md px-4">
          Design and build sustainable urban environments with our interactive city planning tools
        </p>
      </div>
      
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{isLogin ? "Login" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to access your city designs" : "Register to start creating sustainable cities"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Sign In"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onSubmitRegister)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Register"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="link"
            className="mx-auto"
            onClick={toggleForm}
            disabled={isLoading}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>SustainCityPlanner &copy; {new Date().getFullYear()} - Building sustainable futures together</p>
      </div>
    </div>
  );
};

export default Login;
