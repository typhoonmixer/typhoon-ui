import { Tornado } from "lucide-react";
import Link from "next/link";
import React from "react";

function Logo({ href = "#", classname = "" }) {
  return (
    <Link href={href} className={`mr-0 flex items-center gap-2 ${classname}`}>
      <Tornado className="h-5 w-5 text-accent" />
      <span>Typhoon</span>
    </Link>
  );
}

export default Logo;
