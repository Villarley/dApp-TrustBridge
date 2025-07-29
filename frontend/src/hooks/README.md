# Hooks Documentation

## useBorrowAPY

A React hook that calculates real-time Borrow APY (Annual Percentage Yield) for different tokens based on supplied and borrowed amounts.

### Usage

```typescript
import { useBorrowAPY } from '@/hooks/useBorrowAPY';

function MyComponent() {
  const supplied = {
    USDC: 1000000, // 1M USDC supplied
    XLM: 500000,   // 500K XLM supplied
    TBRG: 200000,  // 200K TBRG supplied
  };

  const borrowed = {
    USDC: 200000,  // 200K USDC borrowed
    XLM: 100000,   // 100K XLM borrowed
    TBRG: 40000,   // 40K TBRG borrowed
  };

  const borrowAPYs = useBorrowAPY(supplied, borrowed);

  return (
    <div>
      {borrowAPYs.map((rate) => (
        <div key={rate.token}>
          {rate.token}: {rate.apy}% APY (Utilization: {rate.utilizationRate}%)
        </div>
      ))}
    </div>
  );
}
```

### Parameters

- `supplied`: Record<Token, number> - Amount supplied for each token
- `borrowed`: Record<Token, number> - Amount borrowed for each token

### Returns

Array of APY objects with the following structure:
```typescript
interface APY {
  token: "USDC" | "XLM" | "TBRG";
  apy: number;           // APY percentage (e.g., 6.25)
  utilizationRate: number; // Utilization percentage (e.g., 20.00)
}
```

### APY Calculation Formula

The hook uses a simplified formula based on utilization rate:

```
APY = Base Rate + (Utilization Rate × Multiplier)
```

Where:
- **Base Rates**: USDC (1%), XLM (2%), TBRG (3%)
- **Multipliers**: USDC (25%), XLM (30%), TBRG (35%)
- **Utilization Rate**: borrowed / supplied (clamped to 0-100%)

### Example Calculations

#### Low Utilization (20%)
- USDC: 1% + (20% × 25%) = 1% + 5% = **6%**
- XLM: 2% + (20% × 30%) = 2% + 6% = **8%**
- TBRG: 3% + (20% × 35%) = 3% + 7% = **10%**

#### High Utilization (80%)
- USDC: 1% + (80% × 25%) = 1% + 20% = **21%**
- XLM: 2% + (80% × 30%) = 2% + 24% = **26%**
- TBRG: 3% + (80% × 35%) = 3% + 28% = **31%**

#### Maximum Utilization (100%)
- USDC: 1% + (100% × 25%) = 1% + 25% = **26%**
- XLM: 2% + (100% × 30%) = 2% + 30% = **32%**
- TBRG: 3% + (100% × 35%) = 3% + 35% = **38%**

### Integration with Marketplace

The hook is integrated with the marketplace component to provide real-time APY calculations based on actual pool data:

```typescript
// In useMarketplace.hook.ts
const realTimeBorrowAPY = useBorrowAPY(suppliedAmounts, borrowedAmounts);
```

### Notes

- Utilization rate is clamped between 0% and 100%
- APY values are rounded to 2 decimal places
- The hook automatically recalculates when supplied or borrowed amounts change
- Base rates and multipliers are based on the RESERVE_CONFIGS from contracts.ts 