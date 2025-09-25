"use client";

import { FormEvent, Fragment, useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Link from "next/link";
import { NavMenu } from "../navbar.types";
import { MenuList } from "./MenuList";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MenuItem } from "./MenuItem";
import Image from "next/image";
import InputGroup from "@/components/ui/input-group";
import ResTopNavbar from "./ResTopNavbar";
import CartBtn from "./CartBtn";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const data: NavMenu = [
  {
    id: 1,
    label: "Shop",
    type: "MenuList",
    children: [
      {
        id: 11,
        label: "Men's clothes",
        url: "/shop#men-clothes",
        description: "In attractive and spectacular colors and designs",
      },
      {
        id: 12,
        label: "Women's clothes",
        url: "/shop#women-clothes",
        description: "Ladies, your style and tastes are important to us",
      },
      {
        id: 13,
        label: "Kids clothes",
        url: "/shop#kids-clothes",
        description: "For all ages, with happy and beautiful colors",
      },
      {
        id: 14,
        label: "Bags and Shoes",
        url: "/shop#bag-shoes",
        description: "Suitable for men, women and all tastes and styles",
      },
    ],
  },
  {
    id: 2,
    type: "MenuItem",
    label: "On Sale",
    url: "/shop#on-sale",
    children: [],
  },
  {
    id: 3,
    type: "MenuItem",
    label: "New Arrivals",
    url: "/shop#new-arrivals",
    children: [],
  },
  // {
  //   id: 4,
  //   type: "MenuItem",
  //   label: "Brands",
  //   url: "/shop#brands",
  //   children: [],
  // },
];

const TopNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputId = useId();

  useEffect(() => {
    if (pathname === "/search") {
      setSearchTerm(searchParams.get("q") ?? "");
    } else {
      setSearchTerm("");
    }
  }, [pathname, searchParams]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();

    if (trimmed.length > 0) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      return;
    }

    router.push("/search");
  };

  return (
    <nav className="sticky top-0 z-20 backdrop-blur-md bg-white/80">
      <div className="flex relative max-w-frame mx-auto items-center justify-between md:justify-start py-5 md:py-6 px-4 xl:px-0">
        <div className="flex items-center">
          <div className="block md:hidden mr-4">
            <ResTopNavbar data={data} />
          </div>
          <Link
            href="/"
            className={cn([
              integralCF.className,
              "text-xl lg:text-2xl mr-3 lg:mr-10 whitespace-nowrap",
            ])}
          >
            TSR Fashion
          </Link>
        </div>
        <NavigationMenu className="hidden md:flex mr-2 lg:mr-7">
          <NavigationMenuList>
            {data.map((item) => (
              <Fragment key={item.id}>
                {item.type === "MenuItem" && (
                  <MenuItem label={item.label} url={item.url} />
                )}
                {item.type === "MenuList" && (
                  <MenuList data={item.children} label={item.label} />
                )}
              </Fragment>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex w-full max-w-[320px] lg:max-w-md mr-3 lg:mr-10"
        >
          <label className="sr-only" htmlFor={searchInputId}>
            Search products
          </label>
          <InputGroup className="bg-[#F0F0F0]">
            <InputGroup.Text className="pl-0">
              <button
                type="submit"
                aria-label="Search"
                className="flex items-center justify-center rounded-full bg-transparent p-3 text-black/60 transition hover:text-black"
              >
                <Image
                  priority
                  src="/icons/search.svg"
                  height={20}
                  width={20}
                  alt="search"
                  className="min-w-5 min-h-5"
                />
              </button>
            </InputGroup.Text>
            <InputGroup.Input
              type="search"
              name="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search for products..."
              className="bg-transparent placeholder:text-black/40"
              id={searchInputId}
              autoComplete="off"
            />
          </InputGroup>
        </form>
        <div className="flex items-center">
          <Link href="/search" className="block md:hidden mr-[14px] p-1">
            <Image
              priority
              src="/icons/search-black.svg"
              height={100}
              width={100}
              alt="search"
              className="max-w-[22px] max-h-[22px]"
            />
          </Link>
          <CartBtn />
          <Link href="/profile" className="p-1">
            <Image
              priority
              src="/icons/user.svg"
              height={100}
              width={100}
              alt="user"
              className="max-w-[22px] max-h-[22px]"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
