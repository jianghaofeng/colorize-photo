import { createId } from "@paralleldrive/cuid2";

import { stripe } from "~/lib/stripe";
// 导入 Supabase Auth 相关函数
import { getCurrentSupabaseUser } from "~/lib/supabase-auth";
import { createClient } from "~/lib/supabase/server";

/**
 * 创建新客户
 */
export async function createCustomer(
  userId: string,
  email: string,
  name?: string,
) {
  try {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
      name: name || email,
    });

    // 使用 Supabase 存储客户信息
    const supabase = await createClient();
    await supabase.from('stripe_customer').insert({
      created_at: new Date().toISOString(),
      customer_id: customer.id,
      id: createId(),
      updated_at: new Date().toISOString(),
      user_id: userId,
    });

    return customer;
  } catch (error) {
    console.error("创建客户错误:", error);
    throw error;
  }
}

/**
 * 创建客户门户会话
 */
export async function createCustomerPortalSession(
  customerId: string,
): Promise<null | string> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return session.url;
  } catch (error) {
    console.error("创建客户门户会话错误:", error);
    return null;
  }
}

/**
 * 获取结账 URL
 */
export async function getCheckoutUrl(
  userId: string,
  priceId: string,
): Promise<null | string> {
  try {
    // 获取客户 ID，如果不存在则创建
    let customer = await getCustomerByUserId(userId);

    if (!customer) {
      // 使用 Supabase Auth 获取用户信息
      const supabaseUser = await getCurrentSupabaseUser();

      if (!supabaseUser || !supabaseUser.email) {
        throw new Error("用户信息不存在");
      }

      const newCustomer = await createCustomer(
        userId,
        supabaseUser.email,
        supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
      );
      customer = {
        created_at: new Date().toISOString(),
        customer_id: newCustomer.id,
        id: createId(),
        updated_at: new Date().toISOString(),
        user_id: userId,
      };
    }

    // 创建结账会话
    const session = await stripe.checkout.sessions.create({
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      customer: customer.customer_id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    });

    return session.url;
  } catch (error) {
    console.error("生成结账 URL 错误:", error);
    return null;
  }
}

/**
 * 获取用户的 Stripe 客户信息
 */
export async function getCustomerByUserId(userId: string) {
  // 使用 Supabase 查询客户信息
  const supabase = await createClient();
  const { data: customer, error } = await supabase
    .from('stripe_customer')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !customer) {
    return null;
  }

  return customer;
}

/**
 * 获取客户详情
 */
export async function getCustomerDetails(userId: string) {
  const customer = await getCustomerByUserId(userId);

  if (!customer) {
    return null;
  }

  try {
    const customerDetails = await stripe.customers.retrieve(
      customer.customer_id,
    );
    return customerDetails;
  } catch (error) {
    console.error("获取客户详情错误:", error);
    return null;
  }
}

/**
 * 获取用户所有订阅
 */
export async function getUserSubscriptions(userId: string) {
  // 使用 Supabase 查询订阅信息
  const supabase = await createClient();
  const { data: subscriptions, error } = await supabase
    .from('stripe_subscription')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("获取订阅错误:", error);
    return [];
  }

  return subscriptions || [];
}

/**
 * 检查用户是否有有效订阅
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscriptions = await getUserSubscriptions(userId);
  return subscriptions.some((sub) => sub.status === "active");
}

/**
 * 同步订阅数据
 */
export async function syncSubscription(
  userId: string,
  customerId: string,
  subscriptionId: string,
  productId: string,
  status: string,
) {
  try {
    const supabase = await createClient();

    // 检查是否存在订阅
    const { data: existingSubscription } = await supabase
      .from('stripe_subscription')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .single();

    if (existingSubscription) {
      // 更新现有订阅
      const { data: updatedSubscription, error } = await supabase
        .from('stripe_subscription')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('subscription_id', subscriptionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedSubscription;
    }

    // 创建新订阅
    const { data: subscription, error } = await supabase
      .from('stripe_subscription')
      .insert({
        created_at: new Date().toISOString(),
        customer_id: customerId,
        id: createId(),
        product_id: productId,
        status,
        subscription_id: subscriptionId,
        updated_at: new Date().toISOString(),
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return subscription;
  } catch (error) {
    console.error("同步订阅错误:", error);
    throw error;
  }
}
