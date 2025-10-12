import credentialsService from './credentialsService';
import type { Buyer } from './buyerDetectionService';
import type { MatchedSupplier } from './supplierMatchingService';

export interface EmailNegotiation {
  to: string;
  subject: string;
  body: string;
  language: string;
  sent_at: string;
}

class EmailNegotiationService {
  private sendgridKey: string | undefined;

  constructor() {
    this.sendgridKey = credentialsService.getSendGridApiKey();
  }

  async sendBuyerNegotiationEmail(buyer: Buyer, message: string): Promise<boolean> {
    const email = this.composeBuyerEmail(buyer, message);
    return await this.sendEmail(email);
  }

  async sendSupplierNegotiationEmail(
    supplier: MatchedSupplier, 
    buyer: Buyer,
    requirements: any
  ): Promise<boolean> {
    const email = this.composeSupplierEmail(supplier, buyer, requirements);
    return await this.sendEmail(email);
  }

  private composeBuyerEmail(buyer: Buyer, message: string): EmailNegotiation {
    const subjects: Record<string, string> = {
      en: `Re: Your Request for ${buyer.product_needed}`,
      es: `Re: Su solicitud de ${buyer.product_needed}`,
      pt: `Re: Seu pedido de ${buyer.product_needed}`,
      de: `Re: Ihre Anfrage für ${buyer.product_needed}`,
      fr: `Re: Votre demande de ${buyer.product_needed}`,
      zh: `关于：${buyer.product_needed} 的请求`,
      ja: `件名：${buyer.product_needed} のご依頼について`
    };

    return {
      to: buyer.email,
      subject: subjects[buyer.language] || subjects.en,
      body: message,
      language: buyer.language,
      sent_at: new Date().toISOString()
    };
  }

  private composeSupplierEmail(
    supplier: MatchedSupplier,
    buyer: Buyer,
    requirements: any
  ): EmailNegotiation {
    const templates: Record<string, string> = {
      en: `Dear ${supplier.name},\n\nWe have a buyer interested in: ${buyer.product_needed}\n\nQuantity: ${buyer.order_volume} units\nTarget Price: $${buyer.max_price} per unit\nDelivery Deadline: ${buyer.delivery_deadline}\n\nYour Offer: $${supplier.unit_price} per unit, ${supplier.delivery_days} days delivery\nCommission: ${(supplier.commission_rate * 100).toFixed(1)}%\n\nPlease confirm availability and final pricing.\n\nBest regards,\nGlobal Supplements Broker`,
      es: `Estimado ${supplier.name},\n\nTenemos un comprador interesado en: ${buyer.product_needed}\n\nCantidad: ${buyer.order_volume} unidades\nPrecio objetivo: $${buyer.max_price} por unidad\nFecha límite de entrega: ${buyer.delivery_deadline}\n\nSu oferta: $${supplier.unit_price} por unidad, entrega en ${supplier.delivery_days} días\nComisión: ${(supplier.commission_rate * 100).toFixed(1)}%\n\nPor favor confirme disponibilidad y precio final.\n\nSaludos cordiales,\nGlobal Supplements Broker`,
      pt: `Caro ${supplier.name},\n\nTemos um comprador interessado em: ${buyer.product_needed}\n\nQuantidade: ${buyer.order_volume} unidades\nPreço alvo: $${buyer.max_price} por unidade\nPrazo de entrega: ${buyer.delivery_deadline}\n\nSua oferta: $${supplier.unit_price} por unidade, ${supplier.delivery_days} dias de entrega\nComissão: ${(supplier.commission_rate * 100).toFixed(1)}%\n\nPor favor confirme disponibilidade e preço final.\n\nAtenciosamente,\nGlobal Supplements Broker`,
      de: `Sehr geehrter ${supplier.name},\n\nWir haben einen Käufer, der an Folgendem interessiert ist: ${buyer.product_needed}\n\nMenge: ${buyer.order_volume} Einheiten\nZielpreis: $${buyer.max_price} pro Einheit\nLieferfrist: ${buyer.delivery_deadline}\n\nIhr Angebot: $${supplier.unit_price} pro Einheit, ${supplier.delivery_days} Tage Lieferung\nProvision: ${(supplier.commission_rate * 100).toFixed(1)}%\n\nBitte bestätigen Sie Verfügbarkeit und Endpreis.\n\nMit freundlichen Grüßen,\nGlobal Supplements Broker`,
      fr: `Cher ${supplier.name},\n\nNous avons un acheteur intéressé par : ${buyer.product_needed}\n\nQuantité : ${buyer.order_volume} unités\nPrix cible : $${buyer.max_price} par unité\nDate limite de livraison : ${buyer.delivery_deadline}\n\nVotre offre : $${supplier.unit_price} par unité, livraison en ${supplier.delivery_days} jours\nCommission : ${(supplier.commission_rate * 100).toFixed(1)}%\n\nVeuillez confirmer la disponibilité et le prix final.\n\nCordialement,\nGlobal Supplements Broker`,
      it: `Gentile ${supplier.name},\n\nAbbiamo un acquirente interessato a: ${buyer.product_needed}\n\nQuantità: ${buyer.order_volume} unità\nPrezzo target: $${buyer.max_price} per unità\nScadenza consegna: ${buyer.delivery_deadline}\n\nLa vostra offerta: $${supplier.unit_price} per unità, consegna in ${supplier.delivery_days} giorni\nCommissione: ${(supplier.commission_rate * 100).toFixed(1)}%\n\nSi prega di confermare disponibilità e prezzo finale.\n\nCordiali saluti,\nGlobal Supplements Broker`,
      zh: `尊敬的 ${supplier.name}，\n\n我们有买家对以下产品感兴趣：${buyer.product_needed}\n\n数量：${buyer.order_volume} 件\n目标价格：每件 $${buyer.max_price}\n交货期限：${buyer.delivery_deadline}\n\n您的报价：每件 $${supplier.unit_price}，${supplier.delivery_days} 天交货\n佣金：${(supplier.commission_rate * 100).toFixed(1)}%\n\n请确认供货情况和最终价格。\n\n此致\nGlobal Supplements Broker`,
      ja: `${supplier.name} 様\n\n以下の製品に興味のあるバイヤーがおります：${buyer.product_needed}\n\n数量：${buyer.order_volume} 個\n目標価格：1個あたり $${buyer.max_price}\n納期：${buyer.delivery_deadline}\n\nご提示価格：1個あたり $${supplier.unit_price}、${supplier.delivery_days}日配送\n手数料：${(supplier.commission_rate * 100).toFixed(1)}%\n\n在庫状況と最終価格をご確認ください。\n\n敬具\nGlobal Supplements Broker`,
      ko: `${supplier.name} 귀하\n\n다음 제품에 관심있는 구매자가 있습니다: ${buyer.product_needed}\n\n수량: ${buyer.order_volume} 개\n목표 가격: 개당 $${buyer.max_price}\n배송 마감일: ${buyer.delivery_deadline}\n\n귀사 견적: 개당 $${supplier.unit_price}, ${supplier.delivery_days}일 배송\n수수료: ${(supplier.commission_rate * 100).toFixed(1)}%\n\n재고 확인 및 최종 가격을 확인해 주세요.\n\n감사합니다\nGlobal Supplements Broker`
    };

    const subject_templates: Record<string, string> = {
      en: `Buyer Request: ${buyer.product_needed}`,
      es: `Solicitud de comprador: ${buyer.product_needed}`,
      pt: `Pedido do comprador: ${buyer.product_needed}`,
      de: `Käuferanfrage: ${buyer.product_needed}`,
      fr: `Demande d'acheteur : ${buyer.product_needed}`,
      it: `Richiesta acquirente: ${buyer.product_needed}`,
      zh: `买家需求：${buyer.product_needed}`,
      ja: `バイヤーリクエスト：${buyer.product_needed}`,
      ko: `구매자 요청: ${buyer.product_needed}`
    };

    return {
      to: `supplier_${supplier.id}@example.com`,
      subject: subject_templates[supplier.language] || subject_templates.en,
      body: templates[supplier.language] || templates.en,
      language: supplier.language,
      sent_at: new Date().toISOString()
    };
  }

  private async sendEmail(email: EmailNegotiation): Promise<boolean> {
    if (!this.sendgridKey) {
      console.log('📧 [SIMULATION] Email would be sent:', email);
      return true;
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sendgridKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: email.to }],
            subject: email.subject
          }],
          from: { email: 'broker@globalsupplements.com' },
          content: [{
            type: 'text/plain',
            value: email.body
          }]
        })
      });

      if (response.ok) {
        console.log(`✅ Email sent successfully to ${email.to} (${email.language})`);
        return true;
      } else {
        console.error('❌ SendGrid error:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('❌ Email send error:', error);
      return false;
    }
  }
}

export const emailNegotiationService = new EmailNegotiationService();
export default emailNegotiationService;
