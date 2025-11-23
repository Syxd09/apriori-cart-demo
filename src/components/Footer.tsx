import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  RotateCcw
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">SmartMart</h3>
              <p className="text-sm text-muted-foreground">
                Your intelligent shopping companion powered by advanced data mining algorithms.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>123 Shopping Street, Retail City, RC 12345</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@smartmart.com</span>
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Customer Service</h4>
            <div className="space-y-2">
              <Link to="/help" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
              <Link to="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link to="/shipping" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Shipping Info
              </Link>
              <Link to="/returns" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Returns & Exchanges
              </Link>
              <Link to="/size-guide" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Size Guide
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link to="/careers" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Careers
              </Link>
              <Link to="/blog" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link to="/algorithm" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Stay Connected</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Subscribe to get special offers and updates.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button size="sm">Subscribe</Button>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-foreground mb-2">Follow Us</h5>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="p-2">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="p-2">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="p-2">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="p-2">
                  <Youtube className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Features & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Features */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-green-600" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RotateCcw className="h-4 w-4 text-orange-600" />
              <span>Easy Returns</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-wrap justify-center md:justify-end gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>We accept:</span>
            </div>
            <div className="flex gap-1">
              <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
              <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
              <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">A</div>
              <div className="w-8 h-5 bg-yellow-500 rounded text-black text-xs flex items-center justify-center font-bold">P</div>
              <div className="w-8 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">₹</div>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} SmartMart. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;