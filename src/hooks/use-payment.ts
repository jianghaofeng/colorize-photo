"use client";

import { useState } from "react";

type PaymentStatus = "initial" | "processing" | "success" | "error";

/**
 * 支付相关的状态和操作的Hook
 * @returns 支付状态和操作函数
 */
export function usePayment() {
  // 支付状态
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("initial");
  // 是否显示支付界面
  const [showPayment, setShowPayment] = useState(false);
  // 选择的套餐计划ID
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  /**
   * 关闭支付界面并重置状态
   */
  const closePayment = () => {
    setShowPayment(false);
    setPaymentStatus("initial");
    setSelectedPlan("");
  };

  /**
   * 打开支付界面
   */
  const openPayment = () => {
    setShowPayment(true);
  };

  return {
    closePayment,
    openPayment,
    paymentStatus,
    selectedPlan,
    setPaymentStatus,
    setSelectedPlan,
    showPayment,
  };
}
