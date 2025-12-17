import { randomUUID } from "crypto";
import { PlannedOrder, TradeExecutionResult } from "../trading/types";

interface BrokerResponse {
  id?: string;
  status?: "queued" | "executed" | "rejected";
  provider?: string;
  message?: string;
}

export async function executeOrders(orders: PlannedOrder[]): Promise<TradeExecutionResult[]> {
  const brokerUrl = process.env.BROKER_EXECUTION_URL;
  const apiKey = process.env.BROKER_API_KEY;

  if (!brokerUrl || !apiKey) {
    return orders.map((order) => ({
      order,
      status: "queued",
      provider: "paper",
      id: randomUUID(),
      paper: true,
      message: "Paper trading mode - set BROKER_EXECUTION_URL and BROKER_API_KEY to enable live execution.",
    }));
  }

  const executions: TradeExecutionResult[] = [];

  for (const order of orders) {
    try {
      const response = await fetch(`${brokerUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        executions.push({
          order,
          status: "rejected",
          provider: brokerUrl,
          id: randomUUID(),
          paper: false,
          message: `Broker rejected order with status ${response.status}`,
        });
        continue;
      }

      const json = (await response.json()) as BrokerResponse;
      executions.push({
        order,
        status: json.status ?? "executed",
        provider: json.provider ?? brokerUrl,
        id: json.id ?? randomUUID(),
        paper: false,
        message: json.message,
      });
    } catch (error: any) {
      executions.push({
        order,
        status: "rejected",
        provider: brokerUrl,
        id: randomUUID(),
        paper: false,
        message: error?.message ?? "Unknown broker error",
      });
    }
  }

  return executions;
}
