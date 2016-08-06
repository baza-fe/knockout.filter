import '../../src/index';
import uppercase from '../fixtures/uppercase';
import wrap from '../fixtures/wrap';

describe('filter', () => {
    const body = document.body;
    const vm = { text: 'text' };
    const tpl = `
        <p class="uppercase"          data-bind="text: text | uppercase"></p>
        <p class="wrap"               data-bind="text: text | wrap '(' ')' "></p>
        <p class="uppercase-wrap" data-bind="text: text | uppercase | wrap '(' ')' ">
        <p class="title-uppercase"          data-bind="attr: { title: text | uppercase }"></p>
        <p class="title-wrap"               data-bind="attr: { title: text | wrap '(' ')' }"></p>
        <p class="title-uppercase-wrap" data-bind="attr: { title: text | uppercase | wrap '(' ')' }"></p>
    `;

    body.innerHTML = tpl;
    ko.filter('uppercase', uppercase);
    ko.filter('wrap', wrap);
    ko.applyBindings(vm);

    it('register', () => {
        expect(ko.filters.uppercase).toBe(uppercase);
        expect(ko.filters.wrap).toBe(wrap);
    });

    it('registered', () => {
        expect(() => {
            ko.filter('uppercase');
        }).toThrow();
    });

    it('uppercase', () => {
        expect(document.querySelector('.uppercase').textContent).toBe(`${vm.text.toUpperCase()}`);
    });

    it('wrap', () => {
        expect(document.querySelector('.wrap').textContent).toBe(`(${vm.text})`);
    });

    it('uppercase and wrap', () => {
        expect(document.querySelector('.uppercase-wrap').textContent).toBe(`(${vm.text.toUpperCase()})`);
    });

    it('title-uppercase', () => {
        expect(document.querySelector('.title-uppercase').getAttribute('title')).toBe(`${vm.text.toUpperCase()}`);
    });

    it('title-wrap', () => {
        expect(document.querySelector('.title-wrap').getAttribute('title')).toBe(`(${vm.text})`);
    });

    it('title-uppercase and wrap', () => {
        expect(document.querySelector('.title-uppercase-wrap').getAttribute('title')).toBe(`(${vm.text.toUpperCase()})`);
    });
});