"use client";

import { addToCart } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { Product } from "@/types/product.types";
import React from "react";
import { toast } from "react-toastify";

const AddToCartBtn = ({ data }: { data: Product & { quantity: number } }) => {
  const dispatch = useAppDispatch();
  const { sizeSelection, colorSelection } = useAppSelector(
    (state: RootState) => state.products
  );

  return (
    <button
      type="button"
      className="bg-black w-full ml-3 sm:ml-5 rounded-full h-11 md:h-[52px] text-sm sm:text-base text-white hover:bg-black/80 transition-all"
      onClick={() => {
        dispatch(
          addToCart({
            id: data.id,
            name: data.title,
            srcUrl: data.srcUrl,
            price: data.price,
            attributes: [sizeSelection, colorSelection.name],
            discount: data.discount,
            quantity: data.quantity,
          })
        );

        toast.success(
          <div className="space-y-1">
            <p className="font-medium text-zinc-900">Added to cart</p>
            <p className="text-sm text-zinc-500">
              {`${data.title} (${colorSelection.name} / ${sizeSelection}) was added to your bag.`}
            </p>
          </div>,
          {
            icon: false,
          }
        );
      }}
    >
      Add to Cart
    </button>
  );
};

export default AddToCartBtn;
