export default function Footer() {
    return (
        <section className="home-footer">
            <p className="home-footer-text">
                Memento mori; sic transit gloria mundi; carpe diem.
            </p>
            <p className="home-footer-text-copyright">
                ©{new Date().getFullYear()}, Pond Narongrit
            </p>
        </section>
    );
}
