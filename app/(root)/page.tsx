import RIightSidebar from '@/components/RIightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import HeaderBox from '@/components/ui/HeaderBox'
import React from 'react'


const Home = () => {
    const loggedIn = { firstName: 'Kshitiz', lastName: 'Sikriwal', email: 'kshitizsikriwal16@gmail.com' };
    return (
        <section className="home ">
            <div className="home-content">
                <header className="home-header">
                    <HeaderBox
                        type="greeting"
                        title="Welcome"
                        user={loggedIn?.firstName || 'Guest'}
                        subtext="Access and manage your account and transactions efficiently"
                    />

                    <TotalBalanceBox
                        accounts={[]}
                        totalBanks={1}
                        totalCurrentBalance={1250.50}
                    />
                </header>
                RECENT TRANSACTION
            </div>
            <RIightSidebar
                user={loggedIn}
                transactions={[]}
                banks={[{ currentBalance: 1250 }, { currentBalance: 2250.50 }]} />
        </section>
    )
}

export default Home