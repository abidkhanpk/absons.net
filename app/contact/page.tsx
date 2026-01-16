import { getSiteSettings } from "@/lib/site-settings"
import { ContactPageClient } from "./contact-page-client"

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return <ContactPageClient settings={settings} />
}
