import Image from "next/image";
import Link from "next/link";
import React from "react";

function Logo() {
  return (
    <Link href="/dashboard">
      <div className="flex items-center gap-2 cursor-pointer"> {/* Add cursor pointer for better UX */}
        <Image src={"/logo.png"} alt="logo" height={30} width={30} />
        <h2 className="font-bold text-xl">Loop</h2>
      </div>
    </Link>
  );
}

export default Logo;
