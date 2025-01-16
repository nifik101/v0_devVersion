"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeftRight, RefreshCw, Calculator } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { performCalculation } from './calculationModule'

// Exchange rate API function
const fetchExchangeRate = async () => {
  try {
    const response = await fetch('https://api.frankfurter.dev/v1/latest?base=SEK&symbols=IDR');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      SEK_TO_IDR: data.rates.IDR,
      IDR_TO_SEK: 1 / data.rates.IDR,
      lastUpdated: data.date
    };
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    throw error;
  }
}

export default function CurrencyConverter() {
  const [exchangeRate, setExchangeRate] = useState({ SEK_TO_IDR: 1500, IDR_TO_SEK: 1 / 1500 })
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString())
  const [isLoading, setIsLoading] = useState(false)
  const [manualAmount, setManualAmount] = useState('')
  const [isIDRBase, setIsIDRBase] = useState(true)
  const [calculationString, setCalculationString] = useState('')
  const [isCalculatorActive, setIsCalculatorActive] = useState(false)

  const fixedAmounts = [20, 50, 100, 130, 160, 190, 250, 300, 400, 500]

  const updateExchangeRate = async () => {
    setIsLoading(true);
    try {
      const newRates = await fetchExchangeRate();
      setExchangeRate({
        SEK_TO_IDR: newRates.SEK_TO_IDR,
        IDR_TO_SEK: newRates.IDR_TO_SEK
      });
      setLastUpdated(newRates.lastUpdated);
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      alert('Failed to update exchange rates. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    updateExchangeRate()
  }, [])

  const convertCurrency = (amount: number, fromSEK: boolean) => {
    const result = fromSEK
      ? amount * exchangeRate.SEK_TO_IDR
      : amount * exchangeRate.IDR_TO_SEK
    return fromSEK
      ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(result)
      : result.toFixed(2)
  }

  const formatAmount = (amount: string) => {
    return isIDRBase
      ? new Intl.NumberFormat('id-ID').format(parseInt(amount) || 0)
      : amount || '0'
  }

  const handleCalculatorInput = (value: string) => {
    if (value === 'C') {
      setCalculationString('')
      setManualAmount('')
    } else if (value === '=') {
      const result = performCalculation(calculationString)
      setCalculationString(result)
      setManualAmount(result)
    } else {
      setCalculationString(prev => prev + value)
      if (!isCalculatorActive || '0123456789.'.includes(value)) {
        setManualAmount(prev => prev + value)
      }
    }
  }

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100 overflow-auto">
      {/* Section A: Static Converter */}
      <Card className="mb-4">
        <CardContent className="p-2">
          <h2 className="text-lg font-semibold mb-1">Static Converter</h2>
          <div className="grid grid-cols-2 gap-1 text-sm">
            {fixedAmounts.map(amount => (
              <div key={amount} className="flex justify-between">
                <span>{amount} SEK</span>
                <span>{convertCurrency(amount, true)} IDR</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section B: Manual Converter */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold">
              {isIDRBase ? 'IDR ' : 'SEK '}{formatAmount(manualAmount)}
            </div>
            <Button variant="outline" onClick={() => setIsIDRBase(!isIDRBase)} className="flex gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Swap
            </Button>
          </div>
          <div className="text-xl mb-6">
            {manualAmount ? convertCurrency(parseFloat(manualAmount), !isIDRBase) : '0'} {isIDRBase ? 'SEK' : 'IDR'}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800" onClick={() => handleCalculatorInput('7')}>7</Button>
            <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800" onClick={() => handleCalculatorInput('8')}>8</Button>
            <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800" onClick={() => handleCalculatorInput('9')}>9</Button>
            <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800" onClick={() => handleCalculatorInput('4')}>4</Button>
            <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800" onClick={() => handleCalculatorInput('5')}>5</Button>
            <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800" onClick={() => handleCalculatorInput('6')}>6</Button>
            <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800" onClick={() => handleCalculatorInput('1')}>1</Button>
            <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800" onClick={() => handleCalculatorInput('2')}>2</Button>
            <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800" onClick={() => handleCalculatorInput('3')}>3</Button>
            <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800" onClick={() => handleCalculatorInput('0')}>0</Button>
            <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800" onClick={() => handleCalculatorInput('00')}>00</Button>
            <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800" onClick={() => handleCalculatorInput('000')}>000</Button>
            <Button variant="secondary" onClick={() => handleCalculatorInput('C')} className="col-span-2">C</Button>
            <Button variant="secondary" onClick={() => handleCalculatorInput('.')}>.</Button>
          </div>
        </CardContent>
      </Card>

      {/* Section C: Data and Updates */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <p>Last updated: {new Date(lastUpdated).toLocaleString()}</p>
              <p>1 SEK = {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(exchangeRate.SEK_TO_IDR)} IDR</p>
              <p>1 IDR = {exchangeRate.IDR_TO_SEK.toFixed(6)} SEK</p>
            </div>
            <Button onClick={updateExchangeRate} disabled={isLoading} size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}