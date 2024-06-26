import HeaderBox from '@/components/HeaderBox';
import RecentTransactions from '@/components/RecentTransaction';
import RightSidebar from '@/components/RIghtSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
    try {
        const currentPage = Number(page as string) || 1;
        const loggedIn = await getLoggedInUser();

        if (!loggedIn) {
            return <p>Error: User not logged in.</p>;
        }

        const accounts = await getAccounts({
            userId: loggedIn.$id
        });

        if (!accounts || !accounts.data.length) {
            return <p>No accounts found.</p>;
        }

        const accountsData = accounts.data;
        const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

        const account = await getAccount({ appwriteItemId });

        return (
            <section className="home">
                <div className="home-content">
                    <header className="home-header">
                        <HeaderBox
                            type="greeting"
                            title="Welcome"
                            user={loggedIn.firstName || 'Guest'}
                            subtext="Access and manage your account and transactions efficiently."
                        />

                        <TotalBalanceBox
                            accounts={accountsData}
                            totalBanks={accounts.totalBanks}
                            totalCurrentBalance={accounts.totalCurrentBalance}
                        />
                    </header>

                    <RecentTransactions
                        accounts={accountsData}
                        transactions={account?.transactions || []}
                        appwriteItemId={appwriteItemId}
                        page={currentPage}
                    />
                </div>

                <RightSidebar
                    user={loggedIn}
                    transactions={account?.transactions || []}
                    banks={accountsData.slice(0, 2)}
                />
            </section>
        );
    } catch (error) {
        console.error("Error loading home data:", error);
        return <p>Error loading data. Please try again later.</p>;
    }
}

export default Home;
