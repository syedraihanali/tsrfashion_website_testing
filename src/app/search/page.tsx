"use client";

import { FormEvent, useEffect, useState, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputGroup from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/common/ProductCard";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product.types";

const getSuggestionLabel = (value: string) =>
  value
    .split("-")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

type Suggestions = {
  categories: string[];
  styles: string[];
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromParams = searchParams.get("q") ?? "";
  const [searchTerm, setSearchTerm] = useState(queryFromParams);
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestions>({
    categories: [],
    styles: [],
  });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const searchInputId = useId();

  useEffect(() => {
    setSearchTerm(queryFromParams);
  }, [queryFromParams]);

  const normalizedQuery = queryFromParams.trim().toLowerCase();

  useEffect(() => {
    let isMounted = true;

    const controller = new AbortController();

    const loadSuggestions = async () => {
      try {
        setIsLoadingSuggestions(true);
        const response = await fetch("/api/products/meta", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load suggestions");
        }

        const data = (await response.json()) as {
          facets: Suggestions;
        };

        if (isMounted) {
          setSuggestions(data.facets);
        }
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") {
          return;
        }
        console.error("Failed to fetch product suggestions", error);
      } finally {
        if (isMounted) {
          setIsLoadingSuggestions(false);
        }
      }
    };

    loadSuggestions();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const runSearch = async () => {
      const trimmed = normalizedQuery.trim();

      if (!trimmed) {
        setResults([]);
        setSearchError(null);
        return;
      }

      try {
        setIsSearching(true);
        setSearchError(null);
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(
            data?.message ?? "We couldn't search the catalogue right now."
          );
        }

        const data = (await response.json()) as { products: Product[] };

        if (isMounted) {
          setResults(data.products);
        }
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") {
          return;
        }

        console.error("Search request failed", error);
        if (isMounted) {
          setSearchError(
            error instanceof Error
              ? error.message
              : "We couldn't search the catalogue right now."
          );
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    };

    void runSearch();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [normalizedQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();

    if (trimmed.length > 0) {
      router.replace(`/search?q=${encodeURIComponent(trimmed)}`);
      return;
    }

    router.replace("/search");
  };

  const handleSuggestionClick = (value: string) => {
    router.replace(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <section className="py-10 sm:py-14">
          <h1
            className={cn(
              integralCF.className,
              "text-3xl sm:text-[40px] font-bold uppercase text-black"
            )}
          >
            Search the collection
          </h1>
          <p className="mt-3 max-w-2xl text-base text-black/60">
            Browse by product name, category, style or even your favourite
            colour. Results are powered by our curated catalogue and update as
            soon as you confirm your search.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3"
          >
            <label className="sr-only" htmlFor={searchInputId}>
              Search for products
            </label>
            <InputGroup className="bg-[#F0F0F0] max-w-2xl">
              <InputGroup.Input
                type="search"
                name="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={'Try "t-shirt", "casual" or "black"'}
                className="bg-transparent placeholder:text-black/40"
                id={searchInputId}
                autoComplete="off"
              />
            </InputGroup>
            <Button
              type="submit"
              className="h-[52px] rounded-full bg-black px-8 text-base font-semibold text-white"
            >
              Search
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
            {(isLoadingSuggestions
              ? []
              : [...suggestions.categories, ...suggestions.styles]
            ).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-black/70 transition hover:border-black hover:text-black"
              >
                {getSuggestionLabel(suggestion)}
              </button>
            ))}
          </div>
        </section>

        <section className="border border-black/10 rounded-[24px] bg-white p-6 sm:p-8">
          {normalizedQuery.length === 0 ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-black">
                Start by searching for a product
              </h2>
              <p className="mt-2 text-sm text-black/60">
                Use the search bar above or tap a suggested filter to explore
                our latest arrivals.
              </p>
            </div>
          ) : searchError ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-black">We hit a snag</h2>
              <p className="mt-2 text-sm text-black/60">{searchError}</p>
            </div>
          ) : isSearching ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-black">Searching…</h2>
              <p className="mt-2 text-sm text-black/60">
                We&apos;re looking for matches in the catalogue.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-black">
                No results for &quot;{queryFromParams}&quot;
              </h2>
              <p className="mt-2 text-sm text-black/60">
                Double-check your spelling or try searching with a different
                keyword.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold text-black">
                  Showing {results.length} result
                  {results.length > 1 ? "s" : ""}
                </h2>
                <p className="mt-2 text-sm text-black/60 sm:mt-0">
                  Search term: <span className="font-medium">{queryFromParams}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 xs:grid-cols-2 lg:grid-cols-3">
                {results.map((product) => (
                  <ProductCard key={product.id} data={product} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
