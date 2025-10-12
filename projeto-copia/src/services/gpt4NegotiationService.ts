import credentialsService from './credentialsService';
import type { Buyer } from './buyerDetectionService';

export interface NegotiationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  language?: string;
}

export interface NegotiationResult {
  buyer_id: string;
  understood_requirements: {
    product: string;
    max_price: number;
    delivery_deadline: string;
    volume: number;
    special_requirements?: string[];
  };
  conversation_history: NegotiationMessage[];
  negotiation_status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

class GPT4NegotiationService {
  private openaiKey: string | undefined;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.openaiKey = credentialsService.getOpenAIKey();
  }

  async negotiateWithBuyer(buyer: Buyer): Promise<NegotiationResult> {
    if (!this.openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = this.getSystemPrompt(buyer.language);
    const userMessage = this.getBuyerMessage(buyer);

    const messages: NegotiationMessage[] = [
      { role: 'system', content: systemPrompt, language: buyer.language },
      { role: 'user', content: userMessage, language: buyer.language }
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error('GPT-4 API request failed');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      messages.push({
        role: 'assistant',
        content: aiResponse,
        language: buyer.language
      });

      const requirements = this.extractRequirements(buyer, aiResponse);

      return {
        buyer_id: buyer.id,
        understood_requirements: requirements,
        conversation_history: messages,
        negotiation_status: 'completed'
      };
    } catch (error) {
      console.error('GPT-4 negotiation error:', error);
      return {
        buyer_id: buyer.id,
        understood_requirements: {
          product: buyer.product_needed,
          max_price: buyer.max_price,
          delivery_deadline: buyer.delivery_deadline,
          volume: buyer.order_volume
        },
        conversation_history: messages,
        negotiation_status: 'failed'
      };
    }
  }

  private getSystemPrompt(language: string): string {
    const prompts: Record<string, string> = {
      en: `You are a professional B2B broker assistant. Your role is to understand buyer requirements clearly and negotiate the best deals. Always be polite, professional, and ask clarifying questions about: product specifications, budget constraints, delivery deadlines, and order volume.`,
      es: `Eres un asistente profesional de broker B2B. Tu función es comprender claramente los requisitos del comprador y negociar los mejores acuerdos. Siempre sé educado, profesional y haz preguntas aclaratorias sobre: especificaciones del producto, restricciones presupuestarias, plazos de entrega y volumen de pedidos.`,
      pt: `Você é um assistente profissional de corretor B2B. Seu papel é entender claramente os requisitos do comprador e negociar os melhores negócios. Sempre seja educado, profissional e faça perguntas esclarecedoras sobre: especificações do produto, restrições orçamentárias, prazos de entrega e volume de pedidos.`,
      de: `Sie sind ein professioneller B2B-Maklerassistent. Ihre Aufgabe ist es, die Anforderungen der Käufer klar zu verstehen und die besten Angebote auszuhandeln. Seien Sie stets höflich, professionell und stellen Sie klärende Fragen zu: Produktspezifikationen, Budgetbeschränkungen, Lieferfristen und Bestellvolumen.`,
      fr: `Vous êtes un assistant courtier B2B professionnel. Votre rôle est de comprendre clairement les exigences de l'acheteur et de négocier les meilleures offres. Soyez toujours poli, professionnel et posez des questions de clarification sur : les spécifications du produit, les contraintes budgétaires, les délais de livraison et le volume de commande.`,
      zh: `您是一位专业的 B2B 经纪人助理。您的职责是清楚地了解买家需求并谈判最佳交易。始终保持礼貌、专业，并询问以下澄清问题：产品规格、预算限制、交货期限和订单量。`,
      ja: `あなたはプロのB2Bブローカーアシスタントです。あなたの役割は、買い手の要件を明確に理解し、最良の取引を交渉することです。常に丁寧でプロフェッショナルであり、製品仕様、予算制約、納期、注文量について明確な質問をしてください。`
    };

    return prompts[language] || prompts.en;
  }

  private getBuyerMessage(buyer: Buyer): string {
    const messages: Record<string, string> = {
      en: `I need to purchase: ${buyer.product_needed}. My maximum budget is $${buyer.max_price} per unit. I need delivery by ${buyer.delivery_deadline}. Order volume: ${buyer.order_volume} units. Can you help me find the best supplier?`,
      es: `Necesito comprar: ${buyer.product_needed}. Mi presupuesto máximo es $${buyer.max_price} por unidad. Necesito entrega para ${buyer.delivery_deadline}. Volumen de pedido: ${buyer.order_volume} unidades. ¿Puede ayudarme a encontrar el mejor proveedor?`,
      pt: `Preciso comprar: ${buyer.product_needed}. Meu orçamento máximo é $${buyer.max_price} por unidade. Preciso da entrega até ${buyer.delivery_deadline}. Volume do pedido: ${buyer.order_volume} unidades. Pode me ajudar a encontrar o melhor fornecedor?`,
      de: `Ich muss kaufen: ${buyer.product_needed}. Mein Maximalbudget beträgt $${buyer.max_price} pro Einheit. Ich benötige die Lieferung bis ${buyer.delivery_deadline}. Bestellvolumen: ${buyer.order_volume} Einheiten. Können Sie mir helfen, den besten Lieferanten zu finden?`,
      fr: `J'ai besoin d'acheter : ${buyer.product_needed}. Mon budget maximum est de $${buyer.max_price} par unité. J'ai besoin d'une livraison avant ${buyer.delivery_deadline}. Volume de commande : ${buyer.order_volume} unités. Pouvez-vous m'aider à trouver le meilleur fournisseur ?`,
      zh: `我需要购买：${buyer.product_needed}。我的最高预算是每单位 $${buyer.max_price}。我需要在 ${buyer.delivery_deadline} 之前交货。订单量：${buyer.order_volume} 件。您能帮我找到最好的供应商吗？`,
      ja: `購入が必要：${buyer.product_needed}。最大予算は1単位あたり$${buyer.max_price}です。${buyer.delivery_deadline}までに配達が必要です。注文量：${buyer.order_volume}個。最適なサプライヤーを見つけるのを手伝っていただけますか？`
    };

    return messages[buyer.language] || messages.en;
  }

  private extractRequirements(buyer: Buyer, aiResponse: string): NegotiationResult['understood_requirements'] {
    return {
      product: buyer.product_needed,
      max_price: buyer.max_price,
      delivery_deadline: buyer.delivery_deadline,
      volume: buyer.order_volume,
      special_requirements: this.extractSpecialRequirements(aiResponse)
    };
  }

  private extractSpecialRequirements(response: string): string[] {
    const requirements: string[] = [];
    
    if (response.toLowerCase().includes('organic')) requirements.push('Organic certification');
    if (response.toLowerCase().includes('gmp') || response.toLowerCase().includes('certified')) requirements.push('GMP certified');
    if (response.toLowerCase().includes('vegan')) requirements.push('Vegan');
    if (response.toLowerCase().includes('gluten-free')) requirements.push('Gluten-free');
    
    return requirements;
  }
}

export const gpt4NegotiationService = new GPT4NegotiationService();
export default gpt4NegotiationService;
