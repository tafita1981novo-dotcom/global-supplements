import { buyerDetectionService, type Buyer } from './buyerDetectionService';
import { gpt4NegotiationService, type NegotiationResult } from './gpt4NegotiationService';
import { supplierMatchingService, type MatchedSupplier } from './supplierMatchingService';
import { emailNegotiationService } from './emailNegotiationService';

export interface AutomationDeal {
  id: string;
  buyer: Buyer;
  negotiation: NegotiationResult;
  matched_suppliers: MatchedSupplier[];
  best_supplier: MatchedSupplier | null;
  commission_earned: number;
  total_value: number;
  status: 'detecting' | 'negotiating' | 'matching' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

class AutomationOrchestrator {
  private isRunning = false;
  private dealHistory: AutomationDeal[] = [];

  async start24x7Automation(): Promise<void> {
    if (this.isRunning) {
      console.log('Automation already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting 24/7 Broker Automation...');

    while (this.isRunning) {
      try {
        await this.runAutomationCycle();
        await this.sleep(300000);
      } catch (error) {
        console.error('Automation cycle error:', error);
        await this.sleep(60000);
      }
    }
  }

  stop24x7Automation(): void {
    this.isRunning = false;
    console.log('🛑 Stopping automation...');
  }

  private async runAutomationCycle(): Promise<void> {
    console.log('🔄 Running automation cycle...');

    const buyers = await buyerDetectionService.detectBuyersFromAmazon(7);
    console.log(`✅ Detected ${buyers.length} potential buyers`);

    for (const buyer of buyers.slice(0, 5)) {
      try {
        const deal = await this.processSingleBuyer(buyer);
        this.dealHistory.unshift(deal);
        
        if (this.dealHistory.length > 100) {
          this.dealHistory = this.dealHistory.slice(0, 100);
        }

        await this.saveDealToDatabase(deal);
        await this.notifyDashboard(deal);
      } catch (error) {
        console.error(`Error processing buyer ${buyer.id}:`, error);
      }
    }
  }

  private async processSingleBuyer(buyer: Buyer): Promise<AutomationDeal> {
    const deal: AutomationDeal = {
      id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      buyer,
      negotiation: {} as NegotiationResult,
      matched_suppliers: [],
      best_supplier: null,
      commission_earned: 0,
      total_value: 0,
      status: 'detecting',
      created_at: new Date().toISOString()
    };

    deal.status = 'negotiating';
    const negotiation = await gpt4NegotiationService.negotiateWithBuyer(buyer);
    deal.negotiation = negotiation;

    deal.status = 'matching';
    const suppliers = await supplierMatchingService.findMatchingSuppliers(negotiation);
    deal.matched_suppliers = suppliers;

    const bestSupplier = await supplierMatchingService.selectBestSupplier(suppliers);
    deal.best_supplier = bestSupplier;

    if (bestSupplier) {
      await emailNegotiationService.sendSupplierNegotiationEmail(
        bestSupplier, 
        buyer, 
        negotiation.understood_requirements
      );
      
      deal.commission_earned = bestSupplier.commission_amount;
      deal.total_value = bestSupplier.total_cost;
      deal.status = 'completed';
      deal.completed_at = new Date().toISOString();

      console.log(`✅ Deal completed: $${deal.commission_earned.toFixed(2)} commission`);
      console.log(`📧 Negotiation email sent to ${bestSupplier.name} (${bestSupplier.language})`);
    } else {
      deal.status = 'failed';
      console.log(`❌ No matching suppliers found for buyer ${buyer.id}`);
    }

    return deal;
  }

  private async saveDealToDatabase(deal: AutomationDeal): Promise<void> {
    try {
      localStorage.setItem(`deal_${deal.id}`, JSON.stringify(deal));
      console.log('Deal saved to localStorage:', deal.id);
    } catch (error) {
      console.error('LocalStorage save error:', error);
    }
  }

  private async notifyDashboard(deal: AutomationDeal): Promise<void> {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('automation-deal-update', { detail: deal }));
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getDealHistory(): AutomationDeal[] {
    return this.dealHistory;
  }

  async getRecentDeals(limit: number = 20): Promise<AutomationDeal[]> {
    try {
      const deals: AutomationDeal[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('deal_')) {
          const dealData = localStorage.getItem(key);
          if (dealData) {
            deals.push(JSON.parse(dealData));
          }
        }
      }
      
      deals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return deals.slice(0, limit);
    } catch (error) {
      console.error('Error fetching deals from localStorage:', error);
      return this.dealHistory.slice(0, limit);
    }
  }

  async getStats() {
    const deals = await this.getRecentDeals(100);
    const completed = deals.filter(d => d.status === 'completed');
    
    return {
      total_deals: deals.length,
      completed_deals: completed.length,
      total_commission: completed.reduce((sum, d) => sum + d.commission_earned, 0),
      total_value: completed.reduce((sum, d) => sum + d.total_value, 0),
      success_rate: deals.length > 0 ? (completed.length / deals.length) * 100 : 0,
      avg_commission: completed.length > 0 
        ? completed.reduce((sum, d) => sum + d.commission_earned, 0) / completed.length 
        : 0
    };
  }
}

export const automationOrchestrator = new AutomationOrchestrator();
export default automationOrchestrator;
