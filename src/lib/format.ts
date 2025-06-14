/**
 * 格式化货币金额
 * 将数字格式化为货币表示形式
 */
export function formatCurrency(amount: number, currency = "USD") {
  // 价格以美分存储，转换为美元显示
  const value = amount / 100;
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(value);
}

/**
 * 格式化日期时间
 * 将日期字符串格式化为本地日期时间表示
 */
export function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString();
}
