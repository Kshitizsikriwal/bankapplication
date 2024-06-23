import React, { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link';
import { useRouter } from 'next/navigation';
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions';
import Image from 'next/image';

const PlaidLink = ({ user, variant }: PlaidLinkProps) => {
    const router = useRouter();
    const [token, setToken] = useState('');

    useEffect(() => {
        const getLinkToken = async () => {
            try {
                const data = await createLinkToken(user);
                console.log("Link token:", data?.linkToken); // Debugging log
                setToken(data?.linkToken);
            } catch (error) {
                console.error("Error creating link token:", error);
            }
        };

        getLinkToken();
    }, [user]);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string) => {
        try {
            await exchangePublicToken({
                publicToken: public_token,
                user,
            });
            router.push('/');
        } catch (error) {
            console.error("Error exchanging public token:", error); // Debugging log
        }
    }, [user]);

    const config: PlaidLinkOptions = {
        token,
        onSuccess
    };

    const { open, ready } = usePlaidLink(config);

    useEffect(() => {
        console.log("Token updated:", token); // Debugging log
    }, [token]);

    return (
        <>
            {token && (
                <>
                    {variant === 'primary' ? (
                        <Button
                            onClick={() => {
                                console.log("Button clicked"); // Debugging log
                                open();
                            }}
                            disabled={!ready}
                            className="plaidlink-primary"
                        >
                            Connect bank
                        </Button>
                    ) : variant === 'ghost' ? (
                        <Button onClick={() => open()} variant="ghost" className="plaidlink-ghost">
                            <Image
                                src="/icons/connect-bank.svg"
                                alt="connect bank"
                                width={24}
                                height={24}
                            />
                            <p className='hidden text-[16px] font-semibold text-black-2 xl:block'>Connect bank</p>
                        </Button>
                    ) : (
                        <Button onClick={() => open()} className="plaidlink-default">
                            <Image
                                src="/icons/connect-bank.svg"
                                alt="connect bank"
                                width={24}
                                height={24}
                            />
                            <p className='hidden text-[16px] font-semibold text-black-2 xl:block'>Connect bank</p>
                        </Button>
                    )}
                </>
            )}
        </>
    );
}

export default PlaidLink;
