import { getUserSubscriptionPlan } from "@/lib/stripe"
import BillingForm from "@/components/BillingForm"

const Page = async() => {
    const subPlan = await getUserSubscriptionPlan()

    return <BillingForm subPlan={subPlan} />
}

export default Page