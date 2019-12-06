import React, {
  useEffect,
  useReducer,
} from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import {
  applySpec,
  complement,
  filter,
  map,
  pipe,
  prop,
  propEq,
} from 'ramda'
import {
  Button,
  DateSelector,
  Flexbox,
  isMomentPropValidation,
  SpacedSegmentedSwitch,
  Spacing,
} from 'former-kit'
import Calendar24 from 'emblematic-icons/svg/Calendar24.svg'

import translateDateInput from '../../formatters/dateInputTranslator'
import styles from './style.css'

const excludeCustomPreset = filter(
  complement(propEq('key', 'custom'))
)

const getOptionsFromPresets = pipe(
  excludeCustomPreset,
  map(applySpec({
    title: prop('label'),
    value: prop('key'),
  }))
)

const buildDates = (daysToAdd) => {
  const now = moment()
  const start = moment().add(daysToAdd, 'days')

  return {
    end: now,
    start,
  }
}

const findPresetFromKey = (presets, presetKey) => presets
  .find(({ key }) => key === presetKey)

const reducer = (prevState, updatedState) => ({
  ...prevState,
  ...updatedState,
})

const initialState = {
  confirmDisabled: true,
  selectedPreset: '',
  showCalendar: false,
}

const Header = ({
  dates,
  labels,
  onDateConfirm,
  presets,
  selectedPreset,
  t,
}) => {
  const [state, setState] = useReducer(reducer, initialState)

  useEffect(() => {
    setState({ dates })
  }, [dates])

  useEffect(() => {
    setState({ selectedPreset })
  }, [selectedPreset])

  const handleDateChange = (rangeDates) => {
    setState({
      confirmDisabled: false,
      dates: rangeDates,
    })
  }

  const handleFilterConfirm = () => {
    setState({
      confirmDisabled: true,
      selectedPreset: 'custom',
    })

    onDateConfirm(state.dates)
  }

  const handlePeriodChange = () => {
    setState({
      showCalendar: false,
    })
  }

  const handlePresetChange = (presetKey) => {
    setState({
      confirmDisabled: true,
      selectedPreset: presetKey,
      showCalendar: false,
    })

    const preset = findPresetFromKey(presets, presetKey)

    const range = buildDates(preset.date())
    onDateConfirm(range, preset)
  }

  const isUsingCustomDates = state.selectedPreset === 'custom'

  return (
    <Flexbox
      alignItems="center"
      justifyContent="space-between"
    >
      <div className={styles.greeting}>
        <h3 className={styles.name}>{labels.greeting}</h3>
        <span>{labels.description}</span>
      </div>
      <Flexbox
        alignItems="center"
        className={styles.dates}
      >
        <Spacing size="medium" />
        <SpacedSegmentedSwitch
          name="home-date-preset"
          options={getOptionsFromPresets(presets)}
          onChange={handlePresetChange}
          relevance="low"
          spacing="tiny"
          value={state.selectedPreset}
        />
        <Spacing size="tiny" />
        <div className={styles.dateSelectorContainer}>
          <DateSelector
            dates={state.dates}
            placement="bottomEnd"
            isValidDay={date => moment().isSameOrAfter(date)}
            onChange={handleDateChange}
            onConfirm={handlePeriodChange}
            selectionMode="period"
            showSidebar={false}
            strings={translateDateInput(t)}
            visible={state.showCalendar}
          >
            <Button
              fill="clean"
              icon={(
                <Calendar24
                  color={isUsingCustomDates
                    ? '#37cc9a'
                    : '#4d4f62'
                  }
                  height={13}
                  width={13}
                />
              )}
              onClick={() => setState({ showCalendar: true })}
            />
          </DateSelector>
        </div>
        <Spacing size="small" />
        <Button
          disabled={state.confirmDisabled}
          fill="outline"
          onClick={handleFilterConfirm}
        >
          {t('filter_action')}
        </Button>
      </Flexbox>
    </Flexbox>
  )
}

Header.propTypes = {
  dates: PropTypes.shape({
    end: isMomentPropValidation,
    start: isMomentPropValidation,
  }).isRequired,
  labels: PropTypes.shape({
    description: PropTypes.node.isRequired,
    greeting: PropTypes.string.isRequired,
  }).isRequired,
  onDateConfirm: PropTypes.func.isRequired,
  presets: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.func,
      label: PropTypes.string,
    })
  ).isRequired,
  selectedPreset: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
}

export default Header
