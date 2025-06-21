// src/stores/cartStore.js
import { create } from 'zustand';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { CartItem, CartState } from '@/types/cart.type'; // Import từ file types

const CART_COOKIE_KEY = 'shoppingCart';

const loadCartFromCookie = (): CartItem[] => {
  try {
    const cartData = Cookies.get(CART_COOKIE_KEY);
    const parsedData = cartData ? JSON.parse(cartData) : [];
    // Đảm bảo các trường weight và weightUnit tồn tại khi đọc từ cookie
    return parsedData.map((item: CartItem) => ({
      ...item,
      // Cung cấp giá trị mặc định nếu item.weight hoặc item.weightUnit không tồn tại trong cookie cũ
      weight: item.weight || 0,
      weightUnit: item.weightUnit || 'gram', // Hoặc đơn vị mặc định của bạn
    }));
  } catch (error) {
    console.error("Lỗi khi đọc cookie giỏ hàng:", error);
    return [];
  }
};

const saveCartToCookie = (items: CartItem[]) => {
  try {
    Cookies.set(CART_COOKIE_KEY, JSON.stringify(items), { expires: 7 });
  } catch (error) {
    console.error("Lỗi khi lưu cookie giỏ hàng:", error);
  }
};

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isHydrated: false,

  hydrate: () => {
    const cartFromCookie = loadCartFromCookie();
    set({ items: cartFromCookie, isHydrated: true });
  },

  addItem: (itemData) => {
    set((state) => {
      const {
        productId,
        variantId,
        thumb,
        title,
        price,
        discount,
        color,
        size,
        quantity = 1,
        // ⭐ THÊM weight và weightUnit vào đây ⭐
        weight,
        weightUnit,
      } = itemData;

      const discountedPrice = discount && discount > 0 ? price - discount : undefined;

      // Chuyển đổi ID màu và kích thước thành số nếu chúng được lưu trữ dưới dạng số
      const numericalColorId = color?.id ? Number(color.id) : undefined;
      const numericalSizeId = size?.id ? Number(size.id) : undefined;

      // Tạo ID tổng hợp duy nhất cho mục trong giỏ hàng
      const cartItemId = `${productId}-${numericalColorId || 'no-color'}-${numericalSizeId || 'no-size'}-${variantId || 'no-variant'}`;

      const newItem: CartItem = {
        id: cartItemId, // Gán ID tổng hợp vào CartItem.id
        productId: productId,
        variantId: variantId,
        colorId: numericalColorId,
        sizeId: numericalSizeId,
        thumb: thumb,
        title: title,
        price: price,
        discountedPrice: discountedPrice,
        selectedColor: color,
        selectedSizeId: size?.id, // Lưu ý: selectedSizeId vẫn là string nếu size.id là string
        selectedSizeTitle: size?.title,
        quantity: quantity,
        // ⭐ GÁN weight và weightUnit vào newItem ⭐
        weight: weight,
        weightUnit: weightUnit,
      };

      // Tìm kiếm mục hiện có dựa trên productId, colorId, sizeId, variantId
      const existingItem = state.items.find(
        (i) =>
          i.productId === newItem.productId &&
          i.colorId === newItem.colorId &&
          i.sizeId === newItem.sizeId &&
          i.variantId === newItem.variantId
      );

      let updatedItems: CartItem[];
      if (existingItem) {
        updatedItems = state.items.map((i) =>
          (i.productId === newItem.productId &&
            i.colorId === newItem.colorId &&
            i.sizeId === newItem.sizeId &&
            i.variantId === newItem.variantId)
            ? {
                ...i,
                quantity: i.quantity + newItem.quantity,
                // Khi cập nhật số lượng, bạn có thể cũng muốn cập nhật weight/weightUnit
                // đề phòng trường hợp product data thay đổi, nhưng thường thì không cần
                // nếu weight/weightUnit là cố định cho một sản phẩm.
                // Nếu muốn giữ nguyên weight/weightUnit của existingItem, bỏ 2 dòng dưới.
                // weight: newItem.weight,
                // weightUnit: newItem.weightUnit,
              }
            : i
        );
      } else {
        updatedItems = [...state.items, newItem];
      }

      saveCartToCookie(updatedItems);
      return { items: updatedItems };
    });
  },

  removeItem: (cartItemId) => { // Chỉ nhận cartItemId
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== cartItemId);
      saveCartToCookie(updatedItems);
      return { items: updatedItems };
    });
  },

  increaseItemQuantity: (cartItemId) => { // Chỉ nhận cartItemId
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCartToCookie(updatedItems);
      return { items: updatedItems };
    });
  },

  decreaseItemQuantity: (cartItemId) => { // Chỉ nhận cartItemId
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      );
      saveCartToCookie(updatedItems);
      return { items: updatedItems };
    });
  },

  clearCart: () => {
    set({ items: [] as CartItem[] });
    Cookies.remove(CART_COOKIE_KEY);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => {
      const priceToUse = item.discountedPrice !== undefined ? item.discountedPrice : item.price;
      return total + priceToUse * item.quantity;
    }, 0);
  },

  // ⭐ THÊM HÀM MỚI ĐỂ TÍNH TỔNG CÂN NẶNG ⭐
  getTotalWeight: () => {
    return get().items.reduce((totalWeight, item) => {
      let itemWeightInGrams = item.weight || 0;
      if (item.weightUnit && item.weightUnit.toLowerCase() === 'kg') {
        itemWeightInGrams = item.weight * 1000;
      }
      return totalWeight + itemWeightInGrams * item.quantity;
    }, 0);
  },
}));

export const useCart = () => {
  const store = useCartStore();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      store.hydrate();
    }
  }, [store.hydrate]);

  return store;
};

export default useCart;