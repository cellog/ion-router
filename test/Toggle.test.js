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
  it('should freak out if we don\'t initialize', () => {
    connectToggle(error)
    const R = Toggle(() => true)
    expect(() => renderComponent(R, { component: Component, foo: 'bar' }, { week: 1 }))
      .throws('call connectToggle with the connect function from react-redux to ' +
      'initialize Toggle (see https://github.com/cellog/ion-router/issues/1)')
  })
  describe('initialized', () => {
    beforeEach(() => {
      connectToggle(connect)
      Route = Toggle((s, p) => s.week || p.week)
    })
    it('renders the component if the state tester returns true', () => {
      const container = renderComponent(Route, { component: Component, foo: 'bar' }, { week: 1 })
      expect(container.find(Component)).has.length(1)
      expect(container.find('.foo')).has.length(1)
      expect(container.find('.foo').text()).eqls('bar')
    })
    it('renders the component if the state tester returns true from props', () => {
      const container = renderComponent(Route, { component: Component, foo: 'bar', week: 1 }, { week: 0 })
      expect(container.find(Component)).has.length(1)
      expect(container.find('.foo')).has.length(1)
      expect(container.find('.foo').text()).eqls('bar')
    })
    it('renders null if the state tester returns false', () => {
      const container = renderComponent(Route, { component: Component, foo: 'bar' }, { week: 0 })
      expect(container.find(Component)).has.length(0)
      expect(container.text()).eqls('')
    })
    it('renders else if the state tester returns false', () => {
      const Else = () => <div>else</div>
      const container = renderComponent(Route, { component: Component, else: Else }, { week: 0 })
      expect(container.find(Component)).has.length(0)
      expect(container.text()).eqls('else')
    })
    it('does not call state if loaded returns false', () => {
      const spy = sinon.spy(() => true)
      const loaded = sinon.spy(() => false)
      const R = Toggle(spy, loaded)
      const container = renderComponent(R, { component: Component, foo: 'bar', week: 1 }, { week: 0 })

      expect(spy.called).is.false
      expect(loaded.called).is.true
      expect(container.find(Component)).has.length(0)
    })
    it('renders loading element if state is still loading', () => {
      const R = Toggle(() => true, () => false)
      const container = renderComponent(R,
        { component: Component, loadingComponent: () => <div>Loading...</div> })
      expect(container.find(Component)).has.length(0)
      expect(container.text()).eqls('Loading...')
    })
    it('componentLoadingMap', () => {
      const R = Toggle(() => true, () => true, {
        component: 'bobby',
        loadingComponent: 'frenzel',
        else: 'blah'
      })
      const container = renderComponent(R, { component: Component, bobby: 'hi', frenzel: 'there', blah: 'oops' })
      expect(container.find(Component)).has.length(1)
      expect(container.find(Component).props('component')).eqls('hi')
      expect(container.find(Component).props('bobby')).eqls(undefined)
      expect(container.find(Component).props('loadingComponent')).eqls('there')
      expect(container.find(Component).props('frenzel')).eqls(undefined)
      expect(container.find(Component).props('else')).eqls('oops')
      expect(container.find(Component).props('blah')).eqls(undefined)
    })
    it('no specified component', () => {
      const R = Toggle(() => true, () => true)
      const J = () => <R>
        testing
      </R>
      const container = renderComponent(J)
      expect(container.find(DisplaysChildren)).has.length(1)
      expect(container.text()).eqls('testing')
    })
    it('renders children', () => {
      const R = Toggle(() => true, () => true)
      const J = props => <R> {props.children}</R> // eslint-disable-line
      const container = renderComponent(J, { children: <ul><li>hi</li><li>there</li></ul> })
      expect(container.text()).eqls(' hithere')
    })
    it('default displayName', () => {
      const R = Toggle(() => true, () => true)
      const thing = renderComponent(R)
      expect(thing.find(R).unwrap().HOC.displayName).eqls('Toggle(component:DisplaysChildren,else:null,loading:null)')
    })
    it('uses a displayName', () => {
      const Comp = () => <div>hi</div>
      const Load = () => <div>foo</div>
      const Else = () => <div>else</div>
      const R = Toggle(() => true, () => true)
      const thing = renderComponent(R, { component: Comp, loadingComponent: Load, else: Else })
      expect(thing.find(R).unwrap().HOC.displayName).eqls('Toggle(component:Comp,else:Else,loading:Load)')
    })
    it('re-generates the HOC', () => {
      const Load = () => <div>foo</div>
      const R = Toggle(() => true, () => false)
      const container = renderComponent(R)
      const First = container.find(R).unwrap().HOC
      expect(container.text()).eqls('')
      container.props({ loadingComponent: Load })
      expect(container.find(R).unwrap().HOC).is.not.equal(First)
      expect(container.text()).eqls('foo')
    })
    it('does not regenerate the HOC if unnecessary', () => {
      const R = Toggle(() => true, () => true)
      const container = renderComponent(R)
      expect(container.find(R).unwrap().HOC.displayName).eqls('Toggle(component:DisplaysChildren,else:null,loading:null)')
      const First = container.find(R).unwrap().HOC
      expect(container.text()).eqls('')
      container.props({ children: 'hi' })
      expect(container.find(R).unwrap().HOC).equals(First)
      expect(container.text()).eqls('hi')
      container.props({ children: 'foo' })
      expect(container.find(R).unwrap().HOC).equals(First)
      expect(container.text()).eqls('foo')
    })
    it('does not re-render if props do not change', () => {
      const R = Toggle(() => true, () => true)
      const container = renderComponent(R, { foo: 'bar' })
      expect(container.find(R).unwrap().rendered).eqls(1)
      container.props({ foo: 'bar' })
      expect(container.find(R).unwrap().rendered).eqls(1)
    })
  })
  describe('NullComponent', () => {
    const tests = (type) => {
      const tester = (debug = false) =>
        NullComponent(() => <div>loading</div>, () => <div>component</div>,
          () => <div>else</div>, debug, console)
      it(`${type} displays loading if not loaded`, () => {
        const comp = renderComponent(tester(false))
        expect(comp.text()).eqls('loading')
      })
      it(`${type} displays main component if loaded and active`, () => {
        const comp = renderComponent(tester(false), { '@@__loaded': true, '@@__isActive': true })
        expect(comp.text()).eqls('component')
      })
      it(`${type} displays else component if loaded and not active`, () => {
        const comp = renderComponent(tester(false), { '@@__loaded': true, '@@__isActive': false })
        expect(comp.text()).eqls('else')
      })
      it(`${type} does not re-render if props do not change`, () => {
        const container = renderComponent(tester(false), { '@@__loaded': true, '@@__isActive': false })
        expect(container.find('Toggle').unwrap().rendered).eqls(1)
        container.props({ '@@__loaded': true, '@@__isActive': false })
        expect(container.find('Toggle').unwrap().rendered).eqls(1)
        container.props({ '@@__loaded': true, '@@__isActive': true })
        expect(container.find('Toggle').unwrap().rendered).eqls(2)
        container.props({ '@@__loaded': true, '@@__isActive': true })
        expect(container.find('Toggle').unwrap().rendered).eqls(2)
      })
    }
    describe('production', () => {
      before(() => {
        process.env.NODE_ENV = 'production'
      })
      after(() => {
        process.env.NODE_END = undefined
      })
      tests('production')
    })
    describe('development', () => {
      before(() => {
        process.env.NODE_ENV = 'development'
      })
      after(() => {
        process.env.NODE_END = undefined
      })
      tests('development')
      it('logs debug info to screen', () => {
        const spy = {
          log: sinon.spy()
        }
        const load = () => <div>loading</div>
        const component = () => <div>component</div>
        const elsec = () => <div>else</div>
        const t = NullComponent(load, component,
          elsec, true, spy)
        const comp = renderComponent(t, {
          '@@__loaded': false,
          '@@__isActive': true
        })
        expect(comp.text()).eqls('loading')
        expect(spy.log.called).is.true
        expect(spy.log.args).eqls([
          ['Toggle: loaded: false, active: true'],
          ['Loading component', load, 'Component', component, 'Else', elsec]
        ])
      })
    })
  })
})
