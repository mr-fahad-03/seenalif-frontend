import { useEffect, useState } from "react"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"
import TranslatedText from "../components/TranslatedText"

const PriceFilter = ({ min, max, onApply, initialRange }) => {
  const normalizeRange = (maybeRange) => {
    const raw = Array.isArray(maybeRange) && maybeRange.length === 2 ? maybeRange : [min, max]

    let nextMin = Number(raw[0])
    let nextMax = Number(raw[1])

    if (!Number.isFinite(nextMin)) nextMin = Number(min) || 0
    if (!Number.isFinite(nextMax)) nextMax = Number(max) || 0

    const minBound = Number(min) || 0
    const maxBound = Number(max) || 0

    nextMin = Math.max(minBound, Math.min(nextMin, maxBound))
    nextMax = Math.max(minBound, Math.min(nextMax, maxBound))

    if (nextMin > nextMax) [nextMin, nextMax] = [nextMax, nextMin]

    return [nextMin, nextMax]
  }

  const [range, setRange] = useState(() => normalizeRange(initialRange))
  const [inputMin, setInputMin] = useState(range[0])
  const [inputMax, setInputMax] = useState(range[1])

  useEffect(() => {
    const next = normalizeRange(initialRange)
    setRange(next)
    setInputMin(next[0])
    setInputMax(next[1])
  }, [initialRange, min, max])

  const handleSliderChange = (values) => {
    setRange(values)
    setInputMin(values[0])
    setInputMax(values[1])
  }

  const handleInputMin = (e) => {
    const value = e.target.value
    if (value === "") {
      setInputMin("")
    } else if (!isNaN(value)) {
      const numericValue = Number(value)
      setInputMin(numericValue)
      setRange([numericValue, range[1]])
    }
  }

  const handleInputMax = (e) => {
    const value = e.target.value
    if (value === "") {
      setInputMax("")
    } else if (!isNaN(value)) {
      const numericValue = Number(value)
      setInputMax(numericValue)
      setRange([range[0], numericValue])
    }
  }

  const handleMinFocus = () => setInputMin("")
  const handleMaxFocus = () => setInputMax("")

  const handleApply = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const minValue = inputMin === "" ? 0 : Number(inputMin)
    const maxValue = inputMax === "" ? max : Number(inputMax)
    onApply([minValue, maxValue])
  }

  return (
    <div className="">
      <Slider
        range
        min={min}
        max={max}
        value={range}
        onChange={handleSliderChange}
        trackStyle={[{ backgroundColor: "#84cc16" }]}
        handleStyle={[
          { backgroundColor: "#84cc16", borderColor: "#84cc16" },
          { backgroundColor: "#84cc16", borderColor: "#84cc16" },
        ]}
        railStyle={{ backgroundColor: "#e5e7eb" }}
      />
      <div className="flex justify-between mt-4 mb-2 text-xs font-semibold">
        <span>MIN</span>
        <span>MAX</span>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          className="w-1/2 border rounded px-2 py-1 text-center focus:border-lime-500 focus:ring-lime-500"
          value={inputMin}
          min={min}
          max={inputMax}
          onChange={handleInputMin}
          onFocus={handleMinFocus}
          onBlur={() => {
            if (inputMin === "") setInputMin(0)
          }}
        />
        <input
          type="number"
          className="w-1/2 border rounded px-2 py-1 text-center focus:border-lime-500 focus:ring-lime-500"
          value={inputMax}
          min={inputMin}
          max={max}
          onChange={handleInputMax}
          onFocus={handleMaxFocus}
          onBlur={() => {
            if (inputMax === "") setInputMax(max)
          }}
        />
      </div>
      <button
        type="button"
        className="w-full bg-white border border-lime-500 text-lime-600 rounded py-2 font-semibold hover:bg-lime-50 hover:text-lime-700 hover:border-lime-600 transition"
        onClick={handleApply}
      >
        <TranslatedText>Apply</TranslatedText>
      </button>
    </div>
  )
}

export default PriceFilter
