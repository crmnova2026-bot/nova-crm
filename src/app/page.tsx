import { Users, UserCheck, FileText, Wrench } from "lucide-react";

// 4 κάρτες στατιστικών για το Dashboard της NOVA ΑΠΟΛΥΜΑΝΤΙΚΗ με μπλε θέμα
const stats = [
  {
    title: "Σύνολο Πελατών",
    value: "—",
    icon: Users,
    description: "Όλοι οι πελάτες",
  },
  {
    title: "Ενεργοί Πελάτες",
    value: "—",
    icon: UserCheck,
    description: "Ενεργοί πελάτες αυτή τη στιγμή",
  },
  {
    title: "Προσφορές Μήνα",
    value: "—",
    icon: FileText,
    description: "Προσφορές τρέχοντος μήνα",
  },
  {
    title: "Υπηρεσίες",
    value: "—",
    icon: Wrench,
    description: "Υπηρεσίες απολύμανσης",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-blue-900">
          Πίνακας Ελέγχου
        </h1>
        <p className="mt-1 text-blue-700">
          Καλώς ήρθατε στο Dashboard της NOVA ΑΠΟΛΥΜΑΝΤΙΚΗ
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon, description }) => (
          <div
            key={title}
            className="rounded-xl bg-[var(--card-blue)] p-6 text-white shadow-lg transition-shadow hover:shadow-xl hover:bg-[var(--card-blue-light)]"
            style={{
              background: "var(--card-blue)",
              transition: "background 0.2s"
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">{title}</p>
                <p className="mt-2 text-3xl font-bold text-white">{value}</p>
                <p className="mt-1 text-xs text-blue-100">{description}</p>
              </div>
              <div className="rounded-lg bg-blue-800/80 p-2">
                <Icon className="h-6 w-6 text-blue-200" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
