import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Users, Calendar, BarChart3 } from "lucide-react"
import { redirect } from "next/navigation"

export default function HomePage() {
  redirect("/index.html")
}
