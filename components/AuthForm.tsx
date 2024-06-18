'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import CustomInput from './CustomInput';
import { authFormSchema } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { SignUp, SignIn } from '../lib/actions/user.actions';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    // Add other user fields as needed
}

const AuthForm = ({ type }: { type: string }) => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const formSchema = authFormSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: '',
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            dateOfBirth: '',
            ssn: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            if (type === 'sign-up') {
                const newUser = await SignUp(data);
                setUser(newUser);
            }
            if (type === 'sign-in') {
                const response = await SignIn({
                    email: data.email,
                    password: data.password,
                });

                if (response) {
                    setUser(response);
                    router.push('/');
                }
            }

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="auth-form">
            <header className="flex flex-col gap-5 md:gap-8">
                <Link href='/'>
                    <div className="flex cursor-pointer items-center gap-1">
                        <Image
                            src="/icons/logo.svg"
                            width={34}
                            height={34}
                            alt='Horizon logo'
                        />
                        <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
                            Horizon
                        </h1>
                    </div>
                </Link>
                <div className="flex flex-col gap-1 md:gap-3">
                    <h1 className="text-24 lg:text-36 font-medium text-gray-900">
                        {user ? 'Link Account ' : type === 'sign-in' ? 'Sign-In' : 'Sign-Up'}
                    </h1>
                    <p className="text-16 font-normal text-gray-600">
                        {user ? 'Link your account to get started' : 'Please enter your details'}
                    </p>
                </div>
            </header>
            {user ? (
                <div className="flex flex-col gap-4">
                    {/* PLAIDLINK TO LINK BANK ACCOUNT */}
                </div>
            ) : (
                <>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {type === 'sign-up' && (
                                <>
                                    <div className="flex gap-4">
                                        <CustomInput
                                            control={form.control}
                                            name='firstName'
                                            label="First Name"
                                            placeholder='Enter your First Name'
                                        />
                                        <CustomInput
                                            control={form.control}
                                            name='lastName'
                                            label="Last Name"
                                            placeholder='Enter your Last Name'
                                        />
                                    </div>
                                    <CustomInput
                                        control={form.control}
                                        name='address'
                                        label="Address"
                                        placeholder='Enter your permanent address'
                                    />
                                    <CustomInput
                                        control={form.control}
                                        name='city'
                                        label="City"
                                        placeholder='Enter your City'
                                    />
                                    <div className="flex gap-4">
                                        <CustomInput
                                            control={form.control}
                                            name='state'
                                            label="State"
                                            placeholder='Example Haryana'
                                        />
                                        <CustomInput
                                            control={form.control}
                                            name='postalCode'
                                            label="PinCode"
                                            placeholder='Example 122002'
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <CustomInput
                                            control={form.control}
                                            name='dateOfBirth'
                                            label="DOB"
                                            placeholder='YYYY-MM-DD'
                                        />
                                        <CustomInput
                                            control={form.control}
                                            name='ssn'
                                            label="Social Security Number"
                                            placeholder='1234 1234'
                                        />
                                    </div>
                                </>
                            )}
                            <CustomInput
                                control={form.control}
                                name='email'
                                label="Email"
                                placeholder='Enter your email'
                            />
                            <CustomInput
                                control={form.control}
                                name='password'
                                label="Password"
                                placeholder='Enter your password'
                            />
                            <div className="flex flex-col gap-4">
                                <Button type="submit" disabled={isLoading} className="form-btn">
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" /> &nbsp; Loading...
                                        </>
                                    ) : type === 'sign-in' ? 'Sign In' : 'Sign Up'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                    <footer className="flex justify-center gap-1">
                        <p className="text-14 font-normal text-gray-600">
                            {type === 'sign-in' ? " Don't have an account?" : "Already have an account?"}
                        </p>
                        <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className="form-link">
                            {type === 'sign-in' ? 'Sign Up' : 'Sign In'}
                        </Link>
                    </footer>
                </>
            )}
        </section>
    );
}

export default AuthForm;
