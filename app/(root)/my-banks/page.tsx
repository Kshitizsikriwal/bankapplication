import BankCard from '@/components/BankCard';
import HeaderBox from '@/components/HeaderBox'
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const MyBanks = async () => {
    try {
        const loggedIn = await getLoggedInUser();
        const accounts = await getAccounts({
            userId: loggedIn.$id
        });

        return (
            <section className='flex'>
                <div className="my-banks">
                    <HeaderBox
                        title="My Bank Accounts"
                        subtext="Effortlessly manage your banking activities."
                    />

                    <div className="space-y-4">
                        <h2 className="header-2">
                            Your cards
                        </h2>
                        <div className="flex flex-wrap gap-6">
                            {accounts && accounts.data.map((a: Account) => (
                                <BankCard
                                    key={a.id} // Use a.id as the key
                                    account={a}
                                    userName={loggedIn?.firstName}
                                    showBalance={true} // Pass showBalance prop to display the balance
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    } catch (error) {
        console.error("An error occurred while fetching accounts:", error);
        return <div>Failed to load bank accounts. Please try again later.</div>;
    }
}

export default MyBanks;
