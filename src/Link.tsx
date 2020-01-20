import React, {
  MouseEvent,
  useCallback,
  useContext,
  useState,
  useEffect,
} from 'react'
import RouteParser from 'route-parser'
import invariant from 'invariant'

import * as actions from './actions'
import Context, { RouterContext } from './Context'
import { Location } from 'history'

interface Props {
  route?: string
  children: React.ReactNode
  onClick?: (e: MouseEvent) => void
  to?: string
  replace?: string
  href?: string
}

function createRouteParser(route: string, routeInfo: RouterContext) {
  if (route && routeInfo.routes[route]) {
    return new RouteParser(routeInfo.routes[route].path)
  } else {
    return false
  }
}

function isLocation(s: any): s is Location {
  return s && s.pathname
}

type ValidHTMLAnchorProps =
  | 'download'
  | 'hreflang'
  | 'referrerPolicy'
  | 'rel'
  | 'target'
  | 'type'
  | 'id'
  | 'accessKey'
  | 'className'
  | 'contentEditable'
  | 'dir'
  | 'draggable'
  | 'hidden'
  | 'lang'
  | 'spellcheck'
  | 'style'
  | 'tabIndex'
  | 'title'

export type HTMLAnchor = {
  [P in ValidHTMLAnchorProps]: HTMLAnchorElement[P]
}

const validProps: ValidHTMLAnchorProps[] = [
  'download',
  'hreflang',
  'referrerPolicy',
  'rel',
  'target',
  'type',
  'id',
  'accessKey',
  'className',
  'contentEditable',
  'dir',
  'draggable',
  'hidden',
  'lang',
  'spellcheck',
  'style',
  'tabIndex',
  'title',
]

export function Link<ExtraProps extends { [key: string]: any }>(
  props: Props & HTMLAnchor & ExtraProps
) {
  const { to, replace, onClick, href, children, route, ...extra } = props
  const routeInfo = useContext(Context)
  const [routeState, setRoute] = useState<false | RouteParser>(
    routeInfo ? createRouteParser(route!, routeInfo) : false
  )
  useEffect(() => {
    if (route && routeInfo && routeInfo.routes[route]) {
      setRoute(new RouteParser(routeInfo.routes[route].path))
    }
  }, [route, routeInfo])
  const click = useCallback(
    e => {
      e.preventDefault()
      let url: string | Location
      const action = replace ? 'replace' : 'push'
      if (route) {
        url = routeState
          ? routeState.reverse({ to, replace, href, ...extra }) || ''
          : ''
      } else if (replace) {
        url = replace
      } else {
        url = to || ''
      }
      routeInfo && routeInfo.dispatch(actions[action](url))
      if (onClick) {
        onClick(e)
      }
    },
    [replace, route, routeState, to, routeInfo, href, extra]
  )

  const aProps = Object.keys(props).reduce<
    {
      [P in keyof (Props & HTMLAnchorElement)]?: (Props &
        HTMLAnchorElement &
        ExtraProps)[P]
    }
  >((newProps, key: keyof (Props & HTMLAnchor & ExtraProps)) => {
    if (validProps.includes(key as ValidHTMLAnchorProps))
      (newProps as any)[key] = props[key]
    if ((key as string).slice(0, 5) === 'data-')
      (newProps as any)[key] = props[key]
    return newProps
  }, {})
  invariant(
    !href,
    'href should not be passed to Link, use "to," "replace" or "route" (passed "%s")',
    href
  )
  let landing: string | Location = replace || to || ''
  if (routeState) {
    landing = routeState.reverse(props) || ''
  } else if (isLocation(landing)) {
    landing = `${landing.pathname}${'' + landing.search}${'' + landing.hash}`
  }
  return (
    <a href={landing as string} onClick={click} {...aProps}>
      {children}
    </a>
  )
}

export default Link
