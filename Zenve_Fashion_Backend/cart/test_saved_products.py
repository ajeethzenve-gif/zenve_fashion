from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory, force_authenticate
from accounts.models import Customer
from designers.models import Designer
from products.models import Product
from cart.models import CartItem
from wishlist.models import Wishlist
from cart.saved_views import SavedCartAPIView
from wishlist.saved_views import SavedWishlistAPIView

class SavedProductsTests(TestCase):
    def setUp(self):
        self.user=User.objects.create_user("customer")
        Customer.objects.create(user=self.user,phone_number="9876543210")
        self.other=User.objects.create_user("other")
        Customer.objects.create(user=self.other,phone_number="9876543211")
        designer=Designer.objects.create(designer_name="Test",brand_name="Test",owner_name="Test")
        self.product=Product.objects.create(designer=designer,product_name="Dress",sku="test-dress",category="dress",mrp=100,selling_price=90,inventory_quantity=10)
        self.factory=APIRequestFactory()

    def call(self,view,method,data=None,user=None):
        request=getattr(self.factory,method)("/",data or {},format="json")
        force_authenticate(request,user=user or self.user)
        return view.as_view()(request)

    def item(self,size="M",quantity=1):
        return {"product":{"id":str(self.product.pk)},"selectedSize":size,"selectedColor":{"name":"Gold","hex":"#E4BD5A"},"quantity":quantity,"price":1}

    def test_cart_persists_variants_and_uses_database_price(self):
        response=self.call(SavedCartAPIView,"post",{"items":[self.item(),self.item("L",2)]})
        self.assertEqual(response.status_code,200)
        self.assertEqual(CartItem.objects.filter(user=self.user).count(),2)
        loaded=self.call(SavedCartAPIView,"get")
        self.assertEqual(len(loaded.data),2)
        self.assertEqual(loaded.data[0]["price"],90)
        self.assertEqual(self.call(SavedCartAPIView,"get",user=self.other).data,[])

    def test_invalid_cart_save_preserves_saved_items(self):
        self.call(SavedCartAPIView,"post",{"items":[self.item()]})
        self.assertEqual(self.call(SavedCartAPIView,"post",{"items":[self.item(quantity=999)]}).status_code,400)
        self.assertEqual(CartItem.objects.get(user=self.user).quantity,1)

    def test_wishlist_persists_and_is_customer_specific(self):
        response=self.call(SavedWishlistAPIView,"post",{"productIds":[str(self.product.pk)]})
        self.assertEqual(response.status_code,200)
        self.assertTrue(Wishlist.objects.filter(customer__user=self.user,product=self.product).exists())
        self.assertEqual(len(self.call(SavedWishlistAPIView,"get").data),1)
        self.assertEqual(self.call(SavedWishlistAPIView,"get",user=self.other).data,[])
        self.call(SavedWishlistAPIView,"delete",user=self.other)
        self.assertEqual(Wishlist.objects.count(),1)

    def test_anonymous_cannot_save(self):
        for view,data in [(SavedCartAPIView,{"items":[self.item()]}),(SavedWishlistAPIView,{"productIds":[self.product.pk]})]:
            response=view.as_view()(self.factory.post("/",data,format="json"))
            self.assertIn(response.status_code,[401,403])
        self.assertEqual(CartItem.objects.count(),0)
        self.assertEqual(Wishlist.objects.count(),0)
