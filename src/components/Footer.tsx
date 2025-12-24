export default function Footer() {
    return (
        <section className="home-footer">
            <p className="home-footer-text-copyright">
                © {new Date().getFullYear()}, Pond Narongrit
            </p>
            <p className="home-footer-text">
                Sic transit gloria mundi; carpe diem.
            </p>
        </section>
    );
}
