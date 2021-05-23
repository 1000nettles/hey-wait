import Animator from 'module/Animator';

const ease = jest.createMockFromModule('pixi-ease');
ease.add = jest.fn();

it('exits early if provided an animation type of none', () => {
  const animator = new Animator({}, ease);
  animator.animate(Animator.animationTypes.TYPE_NONE);
  expect(ease.add).not.toHaveBeenCalled();
});
