// Event Listener to back out of modal mode
export default function listenForClose() {
    document.querySelector('body').addEventListener('click', e => {
        let clickedTarget = e.target.className;
        switch(clickedTarget) {
            case 'modal-active':
                document.getElementById('modal').classList.remove('modal-active');
                document.querySelector('.modal-information').remove();
                break;
            default:
                console.log('not success');
        }
    })
}