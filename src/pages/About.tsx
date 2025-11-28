import { Github, Code, Palette, Briefcase } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { cn } from "@/lib/utils";

interface TeamMember {
  name: string;
  role: string;
  github: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Gaffa",
    role: "Developer",
    github: "github.com/GaffaQ",
    icon: Code,
    color: "#4F46E5",
    description: "Bertanggung jawab atas pengembangan dan implementasi fitur-fitur aplikasi.",
  },
  {
    name: "Reno",
    role: "Project Manager",
    github: "github.com/Ren-blink",
    icon: Briefcase,
    color: "#22C55E",
    description: "Mengelola proyek dan memastikan semua fitur berjalan sesuai rencana.",
  },
  {
    name: "Sultan",
    role: "Designer",
    github: "github.com/RajwaSultan",
    icon: Palette,
    color: "#EC4899",
    description: "Mendesain antarmuka pengguna yang menarik dan user-friendly.",
  },
];

const About = () => {
  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Tentang Kami</h1>
        <p className="text-muted-foreground">
          Tim yang mengembangkan aplikasi IniKanMyDompet untuk membantu Anda mengelola keuangan.
        </p>
      </div>

      {/* Project Info */}
      <div className="glass rounded-2xl p-6 mb-8 animate-slide-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Github className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">IniKanMyDompet</h2>
            <p className="text-muted-foreground">Aplikasi Manajemen Keuangan Pribadi</p>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          IniKanMyDompet adalah aplikasi web untuk membantu Anda mengelola keuangan pribadi dengan mudah. 
          Aplikasi ini memungkinkan Anda untuk mencatat pemasukan dan pengeluaran, mengelola kategori, 
          melihat statistik keuangan, dan menetapkan target menabung bulanan.
        </p>
      </div>

      {/* Team Members */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Tim Pengembang</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => {
            const Icon = member.icon;
            return (
              <div
                key={member.github}
                className="glass rounded-2xl p-6 animate-slide-up hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center mb-4">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                    style={{ backgroundColor: `${member.color}20` }}
                  >
                    <Icon
                      className="w-10 h-10"
                      style={{ color: member.color }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full mb-3"
                    style={{
                      backgroundColor: `${member.color}20`,
                      color: member.color,
                    }}
                  >
                    {member.role}
                  </span>
                  <p className="text-sm text-muted-foreground mb-4">
                    {member.description}
                  </p>
                </div>
                <a
                  href={`https://${member.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
                    "bg-secondary hover:bg-secondary/80 transition-colors",
                    "text-foreground font-medium"
                  )}
                >
                  <Github className="w-5 h-5" />
                  <span>{member.github}</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
        <h2 className="text-xl font-semibold text-foreground mb-4">Teknologi yang Digunakan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "React",
            "TypeScript",
            "Vite",
            "Tailwind CSS",
            "Shadcn UI",
            "Recharts",
            "LocalStorage",
            "React Router",
          ].map((tech) => (
            <div
              key={tech}
              className="p-3 rounded-xl bg-secondary/50 text-center text-sm font-medium text-foreground"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default About;

