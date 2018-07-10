import React from 'react'
import Toggle, { connectToggle, error } from '../src/Toggle'
import NullComponent from '../src/NullComponent'
import DisplaysChildren from '../src/DisplaysChildren'
import { renderComponent, connect } from './test_helper'

describe('Toggle', () => {
  const Component = props => ( // eslint-disable-next-line
    <div>
      hi {Object.keys(props).map(prop => <div key={prop} className={prop}>{props[prop]}</div>)}
    </div>
  )
  let Route, state // eslint-disable-line
  test('should freak out if we don\'t initialize', () => {
    connectToggle(error)
    const R = Toggle(() => true)
    expect(() => renderComponent(R, { component: Component, foo: 'bar' }, { week: 1 }))
      .toThrow('call connectToggle with the connect function from react-redux to ' +
      'initialize Toggle (see https://github.com/cellog/ion-router/issues/1)')
  })
  describe('initialized', () => {
    beforeEach(() => {
      connectToggle(connect)
      Route = Toggle((s, p) => s.week || p.week)
    })
    test('renders the component if the state tester returns true', () => {
      const container = renderComponent(Route, { component: Component, foo: 'bar' }, { week: 1 })
      expect(container.find(Component)).toHaveLength(1)
      expect(container.find('.foo')).toHaveLength(1)
      expect(container.find('.foo').text()).toBe('bar')
    })
    test(
      'renders the component if the state tester returns true from props',
      () => {
        const container = renderComponent(Route, { component: Component, foo: 'bar', week: 1 }, { week: 0 })
        expect(container.find(Component)).toHaveLength(1)
        expect(container.find('.foo')).toHaveLength(1)
        expect(container.find('.foo').text()).toBe('bar')
      }
    )
    test('renders null if the state tester returns false', () => {
      const container = renderComponent(Route, { component: Component, foo: 'bar' }, { week: 0 })
      expect(container.find(Component)).toHaveLength(0)
      expect(container.html()).toBe(null)
    })
    test('renders else if the state tester returns false', () => {
      const Else = () => <div>else</div>
      const container = renderComponent(Route, { component: Component, else: Else }, { week: 0 })
      expect(container.find(Component)).toHaveLength(0)
      expect(container.text()).toBe('else')
    })
    test('does not call state if loaded returns false', () => {
      const spy = jest.fn()
      spy.mockReturnValue(true)
      const loaded = jest.fn()
      spy.mockReturnValue(false)
      const R = Toggle(spy, loaded)
      const container = renderComponent(R, { component: Component, foo: 'bar', week: 1 }, { week: 0 })

      expect(spy.mock.calls.length).toBe(0)
      expect(loaded.mock.calls.length).toBe(1)
      expect(container.find(Component)).toHaveLength(0)
    })
    test('renders loading element if state is still loading', () => {
      const R = Toggle(() => true, () => false)
      const container = renderComponent(R,
        { component: Component, loadingComponent: () => <div>Loading...</div> })
      expect(container.find(Component)).toHaveLength(0)
      expect(container.text()).toBe('Loading...')
    })
    test('componentLoadingMap', () => {
      const R = Toggle(() => true, () => true, {
        component: 'bobby',
        loadingComponent: 'frenzel',
        else: 'blah'
      })
      const container = renderComponent(R, { component: Component, bobby: 'hi', frenzel: 'there', blah: 'oops' })
      expect(container.find(Component)).toHaveLength(1)
      expect(container.find(Component).prop('component')).toBe('hi')
      expect(container.find(Component).prop('bobby')).toBe(undefined)
      expect(container.find(Component).prop('loadingComponent')).toBe('there')
      expect(container.find(Component).prop('frenzel')).toBe(undefined)
      expect(container.find(Component).prop('else')).toBe('oops')
      expect(container.find(Component).prop('blah')).toBe(undefined)
    })
    test('no specified component', () => {
      const R = Toggle(() => true, () => true)
      const J = () => <R>
        testing
      </R>
      const container = renderComponent(J)
      expect(container.find(DisplaysChildren)).toHaveLength(1)
      expect(container.text()).toBe('testing')
    })
    test('renders children', () => {
      const R = Toggle(() => true, () => true)
      const J = props => <R> {props.children}</R> // eslint-disable-line
      const container = renderComponent(J, { children: <ul><li>hi</li><li>there</li></ul> })
      expect(container.text()).toBe(' hithere')
    })
    test('default displayName', () => {
      const R = Toggle(() => true, () => true)
      const thing = renderComponent(R)
      expect(thing.find(R).children().name()).toBe('Toggle(component:DisplaysChildren,else:null,loading:null)')
    })
    test('uses a displayName', () => {
      const Comp = () => <div>hi</div>
      const Load = () => <div>foo</div>
      const Else = () => <div>else</div>
      const R = Toggle(() => true, () => true)
      const thing = renderComponent(R, { component: Comp, loadingComponent: Load, else: Else })
      expect(thing.find(R).children().name()).toBe('Toggle(component:Comp,else:Else,loading:Load)')
    })
    test('re-generates the HOC', () => {
      const Load = () => <div>foo</div>
      const R = Toggle(() => true, () => false)
      const container = renderComponent(R)
      const First = container.find(R).children()
      expect(container.html()).toBe(null)
      container.props({ loadingComponent: Load })
      expect(container.find(R).children()).not.toBe(First)
      expect(container.html()).toBe(null)
    })
    test('does not regenerate the HOC if unnecessary', () => {
      const R = Toggle(() => true, () => true)
      const container = renderComponent(R)
      expect(container.find(R).children().name()).toBe('Toggle(component:DisplaysChildren,else:null,loading:null)')
      const First = container.find(R).children()
      expect(container.text()).toBe('')
      container.props({ children: 'hi' })
      container.update()
      expect(container.find(R).children()).toBe(First)
      expect(container.text()).toBe('hi')
      container.props({ children: 'foo' })
      container.update()
      expect(container.find(R).unwrap().HOC).toBe(First)
      expect(container.text()).toBe('foo')
    })
    test('does not re-render if props do not change', () => {
      const R = Toggle(() => true, () => true)
      const container = renderComponent(R, { foo: 'bar' })
      console.log(container.find(R).children().get(0))
      expect(container.find(R).children().rendered).toBe(1)
      container.props({ foo: 'bar' })
      expect(container.find(R).children().rendered).toBe(1)
      container.props({ foo: 'baz' })
      expect(container.find(R).children().rendered).toBe(2)
    })
    test('uses wrapper component', () => {
      const R = Toggle(() => true, () => true)
      const Wrapper = ({ children, ...props }) => <div id="wrapper" {...props}>{children}</div> // eslint-disable-line
      const container = renderComponent(R, { wrapper: Wrapper, wrapperProps: { className: 'foo' } })
      expect(container.find(Wrapper)).toHaveLength(1)
      expect(container.find(Wrapper).prop('className')).toBe('foo')
      expect(container.find('div.foo')).toHaveLength(1)
      expect(container.find(Wrapper).children().rendered).toBe(1)
      container.props({ wrapper: Wrapper, wrapperProps: { className: 'foo' } })
      expect(container.find(Wrapper).children().rendered).toBe(1)
      container.props({ wrapper: Wrapper, wrapperProps: { className: 'bar' } })
      expect(container.find(Wrapper).children().rendered).toBe(2)
    })
    test('uses else with wrapper', () => {
      const R = Toggle(() => false, () => true)
      const Else = () => <div id="else">else</div>
      const Wrapper = ({ children, ...props }) => <div id="wrapper" {...props}>{children}</div> // eslint-disable-line
      const container = renderComponent(R, { wrapper: Wrapper, wrapperProps: { className: 'foo' }, else: Else })
      expect(container.find(Else)).toHaveLength(1)
    })
    test('sets key for component inside wrapper', () => {
      const R = Toggle(() => true, () => true)
      const Wrapper = ({ children, ...props }) => <div id="wrapper" {...props}>{children}</div> // eslint-disable-line
      const container = renderComponent(R,
        { wrapper: Wrapper, wrapperProps: { className: 'foo' } })
      expect(container.find(Wrapper).prop('children').key).toBe('component')
    })
    test('sets key for else inside wrapper', () => {
      const R = Toggle(() => false, () => true)
      const Wrapper = ({ children, ...props }) => <div id="wrapper" {...props}>{children}</div> // eslint-disable-line
      const container = renderComponent(R,
        { wrapper: Wrapper, wrapperProps: { className: 'foo' } })
      expect(container.find(Wrapper).prop('children').key).toBe('else')
    })
    test('sets key for loading inside wrapper', () => {
      const R = Toggle(() => false, () => false)
      const Wrapper = ({ children, ...props }) => <div id="wrapper" {...props}>{children}</div> // eslint-disable-line
      const container = renderComponent(R,
        { wrapper: Wrapper, wrapperProps: { className: 'foo' } })
      expect(container.find(Wrapper).prop('children').key).toBe('loading')
    })
  })
  describe('NullComponent', () => {
    const tests = (type) => {
      const tester = (debug = false) =>
        NullComponent(() => <div>loading</div>, () => <div>component</div>,
          () => <div>else</div>, DisplaysChildren, {}, debug, console)
      test(`${type} displays loading if not loaded`, () => {
        const comp = renderComponent(tester(false))
        expect(comp.text()).toBe('loading')
      })
      test(`${type} displays main component if loaded and active`, () => {
        const comp = renderComponent(tester(false), { '@@__loaded': true, '@@__isActive': true })
        expect(comp.text()).toBe('component')
      })
      test(`${type} displays else component if loaded and not active`, () => {
        const comp = renderComponent(tester(false), { '@@__loaded': true, '@@__isActive': false })
        expect(comp.text()).toBe('else')
      })
      test(`${type} does not re-render if props do not change`, () => {
        const container = renderComponent(tester(false), { '@@__loaded': true, '@@__isActive': false })
        expect(container.find('Toggle').children().rendered).toBe(1)
        container.props({ '@@__loaded': true, '@@__isActive': false })
        expect(container.find('Toggle').children().rendered).toBe(1)
        container.props({ '@@__loaded': true, '@@__isActive': true })
        expect(container.find('Toggle').children().rendered).toBe(2)
        container.props({ '@@__loaded': true, '@@__isActive': true })
        expect(container.find('Toggle').children().rendered).toBe(2)
      })
    }
    describe('production', () => {
      beforeAll(() => {
        process.env.NODE_ENV = 'production'
      })
      afterAll(() => {
        process.env.NODE_END = undefined
      })
      tests('production')
    })
    describe('development', () => {
      beforeAll(() => {
        process.env.NODE_ENV = 'development'
      })
      afterAll(() => {
        process.env.NODE_END = undefined
      })
      tests('development')
      test('logs debug info to screen', () => {
        const spy = {
          log: jest.fn()
        }
        const load = () => <div>loading</div>
        const component = () => <div>component</div>
        const elsec = () => <div>else</div>
        const t = NullComponent(load, component,
          elsec, DisplaysChildren, {}, true, spy)
        const comp = renderComponent(t, {
          '@@__loaded': false,
          '@@__isActive': true
        })
        expect(comp.text()).toBe('loading')
        expect(spy.log.mock.calls.length).toBe(2)
        expect(spy.log.mock.calls).toEqual([
          ['Toggle: loaded: false, active: true'],
          ['Loading component', load, 'Component', component, 'Else', elsec]
        ])
      })
    })
    describe('wrapper', () => {
      test('uses wrapper and props', () => {
        const load = () => <div>loading</div>
        const component = () => <div>component</div>
        const elsec = () => <div>else</div>
        const wrapper = ({ children, ...props }) => <div className="hi" {...props}>{children}</div> // eslint-disable-line
        const t = NullComponent(load, component, elsec, wrapper, { id: 'poo' })
        const comp = renderComponent(t, {
          '@@__loaded': false,
          '@@__isActive': true
        })
        expect(comp.find('.hi')).toHaveLength(1)
        expect(comp.find('.hi').prop('id')).toBe('poo')
      })
    })
  })
})
