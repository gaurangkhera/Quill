import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async() => {
    const {getUser} = getKindeServerSession();

    const user = getUser()

    console.log(user)

    if(!user || !user.id) redirect('/auth-callback?origin=dashboard')
    const dbUser = db.user.findFirst({
        where: {
            id: user.id
        }
    })

    console.log(dbUser.File)

    if(!dbUser) redirect('/auth-callback?origin=dashboard')

    const subPlan = await getUserSubscriptionPlan()

    return <Dashboard subPlan={subPlan}  />
}

export default Page;