export default function Footer() {
    return (
        <section className="home-footer">
            <p className="home-footer-text-copyright">
                © {new Date().getFullYear()}, Pond Narongrit
            </p>
            <div className="home-footer-social">
                <a href="https://www.facebook.com/PixelOrganizationsNeverDone/" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                    Facebook
                </a>
                <a href="https://github.com/dhinsor" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                    Github
                </a>
                <a href="https://dribbble.com/heypond" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                    Dribbble
                </a>
            </div>
        </section>
    );
}
