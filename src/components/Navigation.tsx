
import React from "react";
import { Link } from "react-router-dom";
import { ScrollText, BookOpen, Languages } from "lucide-react";

const Navigation = () => {
  const navItems = [
    {
      title: "实词训练",
      description: "练习实词用法和含义",
      icon: <ScrollText className="w-6 h-6" />,
      path: "/actual-words",
    },
    {
      title: "虚词训练",
      description: "掌握虚词运用技巧",
      icon: <BookOpen className="w-6 h-6" />,
      path: "/function-words",
    },
    {
      title: "翻译练习",
      description: "提高文言文翻译能力",
      icon: <Languages className="w-6 h-6" />,
      path: "/translation",
    },
  ];

  return (
    <nav className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="group p-6 bg-paper rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-ink/10"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 text-ink/80 group-hover:text-ink transition-colors">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-ink">
                {item.title}
              </h3>
              <p className="text-ink/70">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
