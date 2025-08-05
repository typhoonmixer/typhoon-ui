"use client"
import React, { useEffect, useState } from 'react'

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@nextui-org/react'
import {
  STRK,
  USDC,
  DEFAULT_VALUE,
  ETH,
} from '../utils/SupportedCoins'

import {  five, four, three, two, one, denominationsList } from '../utils/SupportedDenominations'

export const CoinSelector = ({ defaultValue, setToken, id, disabled }) => {
  const menu = [
    { key: ETH, name: ETH },
    { key: STRK, name: STRK },
  ]

  const [selectedItem, setSelectedItem] = useState(defaultValue)
  const [ignoreValue, setIgnoreValue] = useState(defaultValue)
  const [menuItems, setMenuItems] = useState(getFilteredItems(defaultValue))

  function getFilteredItems(ignoreValue) {
    return menu.filter(item => item['key'] !== ignoreValue)
  }

  useEffect(() => {
    setMenuItems(getFilteredItems(ignoreValue))
  }, [ignoreValue])

  useEffect(() => {  
    setIgnoreValue(selectedItem)
  }, [selectedItem])

  return (
    <Dropdown disableAnimation={disabled} className='bg-black rounded-xl mr-2'>
      <DropdownTrigger>
        <Button disabled={disabled} variant="bordered" className='bg-black rounded-xl ml-2 mr-7'>{selectedItem}</Button>
      </DropdownTrigger>
      <DropdownMenu className='bg-black rounded-xl' aria-label="Static Actions" items={menuItems} onAction={key => {
        
          setSelectedItem(key)
          setToken(key)
        }}>
          {item => (
          <DropdownItem
            aria-label={id}
            key={item.key}
            color={item.key === 'delete' ? 'error' : 'default'}
          >
            {item.name}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  )
}

export const DenominationSelector = ({ defaultValue, setToken, id, disabled, token }) => {
  console.log("token: ", token)
  console.log("defaultValue: ", defaultValue)
  const menu = [
    { key: denominationsList[token][0], name: denominationsList[token][0] },
    { key: denominationsList[token][1], name: denominationsList[token][1] },
    { key: denominationsList[token][1], name: denominationsList[token][2] },
    { key: denominationsList[token][3], name: denominationsList[token][3] },
  ]

  console.log("menu: ", menu)
  const [selectedItem, setSelectedItem] = useState(denominationsList[token][0])
  const [menuItems, setMenuItems] = useState(getFilteredItems(denominationsList[token][0]))
  const [ignoreValue, setIgnoreValue] = useState(denominationsList[token][0])
  console.log("selectedItem: ", selectedItem)
  function getFilteredItems(ignoreValue) {
    return menu.filter(item => item['key'] !== ignoreValue)
  }

  // useEffect(() => {
  //   setMenuItems(getFilteredItems(denominationsList[token][0]))
  //   setIgnoreValue(denominationsList[token][0])
  //   setSelectedItem(denominationsList[token][0])
  // }, [menu])

  useEffect(() => {
    setMenuItems(getFilteredItems(ignoreValue))
  }, [ignoreValue])

  useEffect(() => {  
    setIgnoreValue(selectedItem)
  }, [selectedItem])

  return (
    <Dropdown disableAnimation={disabled} className='bg-black rounded-xl'>
      <DropdownTrigger>
        <Button disabled={disabled} variant="bordered" className='bg-black rounded-xl ml-2'>{selectedItem}</Button>
      </DropdownTrigger>
      <DropdownMenu  className='bg-black rounded-xl' aria-label="Static Actions" items={menuItems} onAction={key => {
          setSelectedItem(key)
          setToken(key)
        }}>
          {item => (
          <DropdownItem
            aria-label={id}
            key={item.key}
            color={item.key === 'delete' ? 'error' : 'default'}
          >
            {item.name}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  )
}
